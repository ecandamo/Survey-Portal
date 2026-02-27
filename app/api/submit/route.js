import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SurveySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const tokenValue = body?.token;

    if (!tokenValue) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    const token = await prisma.token.findUnique({
      where: { token: tokenValue },
      include: { response: true }
    });

    if (!token) {
      return NextResponse.json({ error: "Invalid token." }, { status: 404 });
    }
    if (token.response) {
      return NextResponse.json({ error: "This link has already been used." }, { status: 409 });
    }

    const parsed = SurveySchema.safeParse({
      role: body.role,
      overallValue: Number(body.overallValue),
      pipelineValue: Number(body.pipelineValue),
      huddleValue: Number(body.huddleValue),
      timeInvestment: body.timeInvestment,
      pipelineChanges: body.pipelineChanges || [],
      pipelineOther: body.pipelineOther || "",
      huddleChanges: body.huddleChanges || [],
      huddleOther: body.huddleOther || "",
      meetingTiming: body.meetingTiming,
      improveOneThing: body.improveOneThing || "",
      anythingElse: body.anythingElse || ""
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your answers.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const resp = await prisma.response.create({
      data: {
        tokenId: token.id,
        role: data.role,
        overallValue: data.overallValue,
        pipelineValue: data.pipelineValue,
        huddleValue: data.huddleValue,
        timeInvestment: data.timeInvestment,
        pipelineChanges: data.pipelineChanges,
        pipelineOther: data.pipelineOther?.trim() || null,
        huddleChanges: data.huddleChanges,
        huddleOther: data.huddleOther?.trim() || null,
        meetingTiming: data.meetingTiming,
        improveOneThing: data.improveOneThing?.trim() || null,
        anythingElse: data.anythingElse?.trim() || null
      }
    });

    await prisma.token.update({
      where: { id: token.id },
      data: { usedAt: new Date() }
    });

    return NextResponse.json({ ok: true, id: resp.id });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error." }, { status: 500 });
  }
}
