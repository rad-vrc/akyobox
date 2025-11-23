import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic"; // キャッシュ無効化（重要）

type Entry = {
  name: string;
  score: number;
  at: number;
};

const KEY = "highscores";
const LIMIT = 10;
const USER_HASH = "highscores-by-user";

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

export async function GET() {
  try {
    // rev: true でスコア降順（高い順）にソートされる
    // 0 から LIMIT-1 (9) まで取得することでトップ10を取得
    const rawMembers = await kv.zrange(KEY, 0, LIMIT - 1, { rev: true });
    const members = rawMembers
      .map((m: unknown) =>
        typeof m === "string"
          ? m
          : typeof m === "object" && m !== null && "member" in (m as any)
          ? String((m as any).member)
          : ""
      )
      .filter((m) => m.length > 0);

    const debugErrors: any[] = [];
    
    // [Refactor] Hashではなく通常のGETを使う
    const entries = await Promise.all(
      members.map(async (member) => {
        try {
          const detailKey = `detail:${member}`;
          const raw = await kv.get<Entry>(detailKey); // Vercel KVのgetは自動でJSONパースしてくれる場合があるが、明示的に型指定
          
          if (!raw) {
              debugErrors.push({ member, error: "null raw (key not found)", key: detailKey });
              // ランキングにあるのにデータがない場合は掃除
              await kv.zrem(KEY, member);
              return null;
          }
          
          // kv.get はオブジェクトをそのまま返すことがある（自動パース）
          // 文字列が返ってきた場合のみ parse する
          const entry = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return entry as Entry;
        } catch (e: any) {
          debugErrors.push({ member, error: e.message });
          return null;
        }
      })
    );
    const parsed = entries.filter((e): e is Entry => !!e);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("GET /api/highscores error", err);
    return NextResponse.json({ error: "failed to fetch scores", details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitizeName(body?.name);
    const anonIdRaw = typeof body?.anonId === "string" ? body.anonId : undefined;
    const anonIdClean =
      anonIdRaw?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || undefined;
    const score = sanitizeScore(body?.score);
    if (score === null) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    // 既存スコアを確認し、同一ユーザーは最大スコアを維持
    const key = userKey(name, anonIdClean);
    
    const entry: Entry = { 
        name: String(name), 
        score: Number(score), 
        at: Date.now() 
    };

    // [Refactor] Hashではなく通常のSETを使う（[object Object]問題の回避）
    const jsonVal = JSON.stringify(entry);

    // [Refactor] Hashではなく通常のSETを使う（[object Object]問題の回避）
    // キーに prefix をつける
    const detailKey = `detail:${key}`;

    // 既存スコアを確認し、ハイスコア更新時のみ保存
    const currentBest = await kv.get<Entry>(detailKey);
    // existing がオブジェクトとして返ってくるか文字列かはドライバ次第だが、Entry型としてキャスト
    
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
            at: finalAt
        };

        // [Refactor] Hashではなく通常のSETを使う（[object Object]問題の回避）
        const jsonVal = JSON.stringify(entry);
        await kv.set(detailKey, jsonVal);
        
        // ソートセットにはユーザーキーのみをメンバーとして登録
        const zaddResult = await kv.zadd(KEY, { score: finalScore, member: key });

        return NextResponse.json({ ok: true, debug: { key, name, score: finalScore, updated: true } });
    }
    
    return NextResponse.json({ ok: true, ignored: true });
  } catch (err: any) {
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed to submit score", details: err.message }, { status: 500 });
  }
}
