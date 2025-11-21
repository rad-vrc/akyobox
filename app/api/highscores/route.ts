import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Entry = {
  name: string;
  score: number;
  at: number;
};

const KEY = "highscores";
const LIMIT = 5;

function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "Anonymous";
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Anonymous";
  // remove angle brackets and control chars
  const cleaned = trimmed.replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, "");
  return cleaned.slice(0, 16);
}

function sanitizeScore(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export async function GET() {
  try {
    const raw = (await kv.zrange(KEY, -LIMIT, -1, { rev: true })) as string[];
    const parsed = raw
      .map((r) => {
        try {
          return JSON.parse(r) as Entry;
        } catch {
          return null;
        }
      })
      .filter((e): e is Entry => !!e);

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

    const entry: Entry = { name, score, at: Date.now() };
    await kv.zadd(KEY, { score: entry.score, member: JSON.stringify(entry) });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
