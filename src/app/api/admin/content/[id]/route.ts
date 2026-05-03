import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "publish", "unpublish"]),
  summary: z.string().max(2000).optional(),
  summaryZh: z.string().max(2000).optional(),
  developerTakeaway: z.string().max(1000).optional(),
  developerTakeawayZh: z.string().max(1000).optional(),
  score: z.number().min(0).max(1).optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { action, summary, summaryZh, developerTakeaway, developerTakeawayZh, score, notes } =
    parsed.data;

  try {
    const item = await db.contentItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Build content updates (only set fields that were provided)
    const contentUpdate: Record<string, unknown> = {};
    if (summary !== undefined) contentUpdate.summary = summary;
    if (summaryZh !== undefined) contentUpdate.summaryZh = summaryZh;
    if (developerTakeaway !== undefined) contentUpdate.developerTakeaway = developerTakeaway;
    if (developerTakeawayZh !== undefined) contentUpdate.developerTakeawayZh = developerTakeawayZh;
    if (score !== undefined) contentUpdate.score = score;

    // Apply status transition
    if (action === "approve") {
      contentUpdate.status = "ENRICHED";
    } else if (action === "reject") {
      contentUpdate.status = "REJECTED";
    } else if (action === "publish") {
      contentUpdate.status = "PUBLISHED";
      if (!item.publishedAt) contentUpdate.publishedAt = new Date();
    } else if (action === "unpublish") {
      contentUpdate.status = "ENRICHED";
    }

    const [updated] = await db.$transaction([
      db.contentItem.update({ where: { id }, data: contentUpdate }),
      db.adminReview.create({
        data: {
          contentItemId: id,
          approved: action === "approve" || action === "publish",
          editedSummary: summary ?? null,
          editedTakeaway: developerTakeaway ?? null,
          notes: notes ?? null,
        },
      }),
    ]);

    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[admin/content/patch]", { id, action, error: message });
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
