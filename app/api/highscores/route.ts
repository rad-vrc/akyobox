import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic"; // キャッシュ無効化（重要）

type Entry = {
  name: string;
  score: number;
  at: number;
  anonId?: string;
};

type PublicEntry = {
  name: string;
  score: number;
  at: number;
};

const KEY = "highscores";
const LIMIT = 10;

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return false;
  if (!url.startsWith("https://")) return false;
  if (url.includes("your_kv_rest_api_url")) return false;
  if (token.includes("your_kv_rest_api_token")) return false;
  return true;
}

function userKey(name: string, anonId?: string) {
  // 名前ベースではなく、常にユニークIDベースで管理する仕様に変更
  // これにより「名前変更」が可能になる
  if (anonId && anonId.length > 0) {
      return `user:${anonId}`;
  }
  // 万が一 anonId がない場合は古いロジック（またはエラー）
  const lowered = name.toLowerCase();
  return `name:${lowered}`;
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "Anonymous";
  const trimmed = raw.trim().replace(/\s+/g, " ");
  // remove angle brackets and control chars
  // eslint-disable-next-line no-control-regex
  const cleaned = trimmed.replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, "");
  if (!cleaned) return "Anonymous";
  return cleaned.slice(0, 16);
}

function sanitizeScore(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function hasMember(x: unknown): x is { member: unknown } {
  return typeof x === "object" && x !== null && "member" in x;
}

export async function GET() {
  if (!isKvConfigured()) {
    console.warn("GET /api/highscores skipped: KV is not configured");
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: "highscore backend unavailable", details: "KV is not configured" },
        { status: 503 }
      );
    }
    return NextResponse.json([]);
  }

  try {
    // rev: true でスコア降順（高い順）にソートされる
    // 0 から LIMIT-1 (9) まで取得することでトップ10を取得
    const rawMembers = await kv.zrange(KEY, 0, LIMIT - 1, { rev: true });
    const members = rawMembers
      .map((m: unknown) =>
        typeof m === "string"
          ? m
          : hasMember(m)
          ? String(m.member)
          : ""
      )
      .filter((m) => m.length > 0);

    // [Refactor] Hashではなく通常のGETを使う
    const entries = await Promise.all(
      members.map(async (member) => {
        try {
          const detailKey = `detail:${member}`;
          const raw = await kv.get<Entry>(detailKey); // Vercel KVのgetは自動でJSONパースしてくれる場合があるが、明示的に型指定
          
          if (!raw) {
              // ランキングにあるのにデータがない場合は掃除
              await kv.zrem(KEY, member);
              return null;
          }
          
          // kv.get はオブジェクトをそのまま返すことがある（自動パース）
          // 文字列が返ってきた場合のみ parse する
          const entry = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return entry as Entry;
        } catch {
          // 壊れたデータは次回以降の表示劣化を防ぐために除去
          await kv.zrem(KEY, member);
          return null;
        }
      })
    );
    const parsed = entries.filter((e): e is Entry => !!e);
    const publicEntries: PublicEntry[] = parsed.map(({ name, score, at }) => ({
      name,
      score,
      at,
    }));

    return NextResponse.json(publicEntries);
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("GET /api/highscores error", err);
    return NextResponse.json({ error: "failed to fetch scores", details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    console.warn("POST /api/highscores skipped: KV is not configured");
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: "highscore backend unavailable", details: "KV is not configured" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, skipped: true, reason: "kv not configured" });
  }

  try {
    const body: unknown = await req.json();
    const payload = typeof body === "object" && body !== null ? body : {};
    const record = payload as Record<string, unknown>;
    const name = sanitizeName(record.name);
    const anonIdRaw = typeof record.anonId === "string" ? record.anonId : undefined;
    const anonIdClean =
      anonIdRaw?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || undefined;
    const score = sanitizeScore(record.score);
    if (score === null) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    // 既存スコアを確認し、同一ユーザーは最大スコアを維持
    const key = userKey(name, anonIdClean);
    
    // [Refactor] Hashではなく通常のSETを使う（[object Object]問題の回避）
    // キーに prefix をつける
    const detailKey = `detail:${key}`;

    // 既存スコアを確認し、ハイスコア更新時のみ保存
    const currentBestRaw = await kv.get<Entry | string>(detailKey);
    let currentBest: Entry | null = null;
    if (typeof currentBestRaw === "string") {
      try {
        currentBest = JSON.parse(currentBestRaw) as Entry;
      } catch {
        currentBest = null;
      }
    } else if (currentBestRaw && typeof currentBestRaw === "object") {
      currentBest = currentBestRaw as Entry;
    }
    
    let shouldUpdate = false;
    let finalScore = score;
    let finalAt = Date.now();

    if (currentBest && typeof currentBest === 'object' && 'score' in currentBest) {
        const bestScore = Number(currentBest.score);
        
        if (score > bestScore) {
            // ハイスコア更新！ -> 全更新
            shouldUpdate = true;
            finalScore = score;
        } else if (currentBest.name !== name) {
            // スコアは更新してないが、名前が変わった -> 名前だけ更新（スコアは維持）
            shouldUpdate = true;
            finalScore = bestScore; // 既存のベストスコアを維持
            finalAt = currentBest.at; // 日時も維持（あるいは更新？まあ維持でよい）
        } else {
            // スコアも名前も更新なし -> 何もしない
            return NextResponse.json({ ok: true, kept: true, debug: { msg: "No changes", old: bestScore, new: score } });
        }
    } else {
        // 新規ユーザー -> 保存
        shouldUpdate = true;
    }

    if (shouldUpdate) {
        const entry: Entry = { 
            name: String(name), 
            score: Number(finalScore), 
          at: finalAt,
          anonId: anonIdClean,
        };

        // [Refactor] Hashではなく通常のSETを使う（[object Object]問題の回避）
        const jsonVal = JSON.stringify(entry);
        await kv.set(detailKey, jsonVal);
        
        // ソートセットにはユーザーキーのみをメンバーとして登録
        await kv.zadd(KEY, { score: finalScore, member: key });

        return NextResponse.json({ ok: true, debug: { key, name, score: finalScore, updated: true } });
    }
    
    return NextResponse.json({ ok: true, ignored: true });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed to submit score", details }, { status: 500 });
  }
}
