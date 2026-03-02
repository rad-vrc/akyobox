import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

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
  anonId?: string;
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

function userKey(name: string, anonId?: string): string | null {
  // 名前ベースではなく、常にユニークIDベースで管理する仕様
  if (anonId && anonId.length > 0) {
    return `user:${anonId}`;
  }
  void name;
  return null;
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "Anonymous";
  const trimmed = raw.trim().replace(/\s+/g, " ");
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

async function cleanupLeaderboardMember(member: string, reason: string): Promise<void> {
  try {
    await kv.zrem(KEY, member);
  } catch (err: unknown) {
    console.warn("GET /api/highscores: failed to cleanup stale member", {
      member,
      reason,
      error: err instanceof Error ? err.message : String(err),
    });
  }
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
    const rawMembers = await kv.zrange(KEY, 0, LIMIT - 1, { rev: true });
    const members: string[] = rawMembers
      .map((m: unknown) =>
        typeof m === "string" ? m : hasMember(m) ? String(m.member) : ""
      )
      .filter((m: string) => m.length > 0);

    const entries: (Entry | null)[] = await Promise.all(
      members.map(async (member: string) => {
        const detailKey = `detail:${member}`;
        let raw: Entry | string | null = null;

        try {
          raw = await kv.get<Entry | string>(detailKey);
        } catch (err: unknown) {
          // 一時的なKV読み取り障害ではランキングメンバーを削除しない
          console.warn("GET /api/highscores: failed to read detail key", {
            detailKey,
            error: err instanceof Error ? err.message : String(err),
          });
          return null;
        }

        if (!raw) {
          // 詳細キーが欠落している stale member はクリーンアップする
          await cleanupLeaderboardMember(member, "detail key missing");
          return null;
        }

        let entry: Entry;
        if (typeof raw === "string") {
          try {
            entry = JSON.parse(raw) as Entry;
          } catch {
            // 破損データはクリーンアップ対象
            await cleanupLeaderboardMember(member, "detail JSON parse error");
            return null;
          }
        } else {
          entry = raw;
        }

        let maskedAnonId: string | undefined;
        if (member.startsWith("user:")) {
          const fullId = member.slice(5);
          maskedAnonId = fullId.slice(0, 8);
        }

        return { ...entry, anonId: maskedAnonId } as Entry;
      })
    );

    const parsed: Entry[] = entries.filter((e: Entry | null): e is Entry => !!e);
    const publicEntries: PublicEntry[] = parsed.map(({ name, score, at, anonId }) => ({
      name,
      score,
      at,
      anonId,
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
    const anonIdClean = anonIdRaw?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || undefined;
    const score = sanitizeScore(record.score);

    if (score === null) {
      return NextResponse.json({ error: "invalid score" }, { status: 400 });
    }

    const key = userKey(name, anonIdClean);
    if (!key) {
      return NextResponse.json(
        {
          error: "anonymous id required",
          details: "Please enable localStorage or use a supported browser",
        },
        { status: 400 }
      );
    }

    const detailKey = `detail:${key}`;
    const currentBestRaw = await kv.get<Entry | string>(detailKey);

    let currentBest: Entry | null = null;
    if (typeof currentBestRaw === "string") {
      try {
        currentBest = JSON.parse(currentBestRaw) as Entry;
      } catch {
        console.warn("Failed to parse currentBest for key:", detailKey);
        currentBest = null;
      }
    } else if (currentBestRaw && typeof currentBestRaw === "object") {
      currentBest = currentBestRaw as Entry;
    }

    let shouldUpdate = false;
    let finalScore = score;
    let finalAt = Date.now();

    if (currentBest && typeof currentBest === "object" && "score" in currentBest) {
      const bestScore = Number(currentBest.score);

      if (score > bestScore) {
        shouldUpdate = true;
        finalScore = score;
      } else if (currentBest.name !== name) {
        shouldUpdate = true;
        finalScore = bestScore;
        finalAt = currentBest.at;
      } else {
        return NextResponse.json({
          ok: true,
          kept: true,
          ...(isDevelopment() && {
            debug: { msg: "No changes", old: bestScore, new: score },
          }),
        });
      }
    } else {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      const entry: Entry = {
        name: String(name),
        score: Number(finalScore),
        at: finalAt,
        anonId: anonIdClean,
      };

      await kv.set(detailKey, JSON.stringify(entry));
      await kv.zadd(KEY, { score: finalScore, member: key });

      return NextResponse.json({
        ok: true,
        ...(isDevelopment() && { debug: { key, name, score: finalScore, updated: true } }),
      });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("POST /api/highscores error", err);
    return NextResponse.json({ error: "failed to submit score", details }, { status: 500 });
  }
}
