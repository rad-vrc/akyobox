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
  const lowered = name.toLowerCase();
  if (lowered === "anonymous") {
    return `anonymous:${anonId && anonId.length > 0 ? anonId : "shared"}`;
  }
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

    // デバッグ用に構造を変更して返す（一時的）
    return NextResponse.json({
        list: parsed,
        debug: {
            rawMembers,
            members, // 抽出されたキー
            debugErrors, // エラー詳細
            limit: LIMIT,
            key: KEY,
            userHashKey: USER_HASH
        }
    });
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
    // もし既存スコアの方が高ければ何もしない
    if (currentBest && typeof currentBest === 'object' && 'score' in currentBest && Number(currentBest.score) >= score) {
        return NextResponse.json({ ok: true, kept: true, debug: { msg: "Highscore not broken", old: currentBest.score, new: score } });
    }

    await kv.set(detailKey, jsonVal);
    
    // ソートセットにはユーザーキーのみをメンバーとして登録
    const zaddResult = await kv.zadd(KEY, { score: entry.score, member: key });

    return NextResponse.json({ ok: true, debug: { key, detailKey, name, score, jsonValType: typeof jsonVal, jsonVal, zaddResult } });
  } catch (err: any) {
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed to submit score", details: err.message }, { status: 500 });
  }
}
