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
      .map((m: unknown) => {
        if (typeof m === "string") return m;
        if (m && typeof m === "object" && "member" in m) {
          const val = (m as { member: unknown }).member;
          if (typeof val === "string") return val;
        }
        return "";
      })
      .filter((m) => m.length > 0);

    const entries = await Promise.all(
      members.map(async (member) => {
        try {
          const raw = await kv.hget<string>(USER_HASH, member);
          if (!raw) return null;
          return JSON.parse(raw) as Entry;
        } catch {
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
    const existingRaw = await kv.hget<string>(USER_HASH, key);
    let existing: Entry | null = null;
    if (existingRaw) {
      try {
        existing = JSON.parse(existingRaw) as Entry;
      } catch {
        existing = null;
      }
    }

    if (existing && existing.score >= score) {
      return NextResponse.json({ ok: true, kept: true });
    }

    const entry: Entry = { name, score, at: Date.now() };
    // ユーザー別に保存
    const hsetResult = await kv.hset(USER_HASH, { [key]: JSON.stringify(entry) });
    // ソートセットにはユーザーキーのみをメンバーとして登録（重複を防ぐ）
    const zaddResult = await kv.zadd(KEY, { score: entry.score, member: key });

    return NextResponse.json({ ok: true, debug: { key, name, score, hsetResult, zaddResult } });
  } catch (err: any) {
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed to submit score", details: err.message }, { status: 500 });
  }
}
