import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { enrichItem, publishEnrichedItems } from "@/lib/ingestion/enricher";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_BATCH = 20;
const MAX_BATCH = 100;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const requested = Number(url.searchParams.get("limit") ?? DEFAULT_BATCH);
  const limit = Math.min(MAX_BATCH, Math.max(1, Number.isFinite(requested) ? requested : DEFAULT_BATCH));

  const pending = await db.contentItem.findMany({
    where: { status: "PENDING" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let enriched = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const { id } of pending) {
    try {
      await enrichItem(id);
      const after = await db.contentItem.findUnique({ where: { id }, select: { status: true } });
      if (after?.status === "ENRICHED") enriched++;
      else {
        failed++;
        if (errors.length < 3) errors.push(`item ${id}: stayed PENDING (enrichItem swallowed error)`);
      }
    } catch (err) {
      failed++;
      if (errors.length < 3) errors.push(`item ${id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const published = await publishEnrichedItems();
  const remaining = await db.contentItem.count({ where: { status: "PENDING" } });

  return NextResponse.json({
    ok: true,
    processed: pending.length,
    enriched,
    failed,
    published,
    remaining,
    errors,
  });
}
