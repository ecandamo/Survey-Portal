import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDateForFilename(date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "";

    if (!process.env.ADMIN_VIEW_KEY || key !== process.env.ADMIN_VIEW_KEY) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const responses = await prisma.response.findMany({
      orderBy: { createdAt: "desc" }
    });

    const headers = [
      "id",
      "createdAt",
      "role",
      "overallValue",
      "pipelineValue",
      "huddleValue",
      "timeInvestment",
      "pipelineChanges",
      "pipelineOther",
      "huddleChanges",
      "huddleOther",
      "meetingTiming",
      "improveOneThing",
      "anythingElse"
    ];

    const rows = responses.map((r) => [
      r.id,
      r.createdAt.toISOString(),
      r.role,
      r.overallValue,
      r.pipelineValue,
      r.huddleValue,
      r.timeInvestment,
      (r.pipelineChanges || []).join("; "),
      r.pipelineOther || "",
      (r.huddleChanges || []).join("; "),
      r.huddleOther || "",
      r.meetingTiming,
      r.improveOneThing || "",
      r.anythingElse || ""
    ]);

    const csvLines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
    const csv = csvLines.join("\n");
    const filename = `survey-results-${formatDateForFilename(new Date())}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error." }, { status: 500 });
  }
}
