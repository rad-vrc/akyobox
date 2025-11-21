import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

type Entry = {
  name: string;
  score: number;
  at: number;
};

const KEY = "highscores";
const LIMIT = 10;
const USER_HASH = "highscores-by-user";

function userKey(name: string) {
  return name.toLowerCase();
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "Anonymous";
  const trimmed = raw.trim().replace(/\s+/g, " ");
  // remove angle brackets and control chars
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
    const members = (await kv.zrange(KEY, -LIMIT, -1, { rev: true })) as string[];
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

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("GET /api/highscores error", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitizeName(body?.name);
    const score = sanitizeScore(body?.score);
    if (score === null) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    // 既存スコアを確認し、同一ユーザーは最大スコアを維持
    const existingRaw = await kv.hget<string>(USER_HASH, userKey(name));
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
    const key = userKey(name);
    await kv.hset(USER_HASH, { [key]: JSON.stringify(entry) });
    // ソートセットにはユーザーキーのみをメンバーとして登録（重複を防ぐ）
    await kv.zadd(KEY, { score: entry.score, member: key });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
