import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SurveyForm from "./surveyForm";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }) {
  const tokenValue = (await params).token;

  const token = await prisma.token.findUnique({
    where: { token: tokenValue },
    include: { response: true }
  });

  if (!token) return notFound();
  const alreadySubmitted = Boolean(token.response);

  return (
    <SurveyForm token={tokenValue} alreadySubmitted={alreadySubmitted} />
  );
}
