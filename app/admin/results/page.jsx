import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function avg(nums) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a,b) => a+b, 0) / nums.length) * 10) / 10;
}

function countBy(list, keyFn) {
  const m = new Map();
  for (const x of list) {
    const k = keyFn(x);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return Array.from(m.entries()).sort((a,b) => b[1] - a[1]);
}

export default async function Results({ searchParams }) {
  const sp = await searchParams;
  const key = sp?.key || "";
  if (!process.env.ADMIN_VIEW_KEY || key !== process.env.ADMIN_VIEW_KEY) {
    redirect("/admin");
  }

  const responses = await prisma.response.findMany({ orderBy: { createdAt: "desc" } });
  const tokensTotal = await prisma.token.count();
  const tokensUsed = await prisma.token.count({ where: { usedAt: { not: null } } });

  const overallAvg = avg(responses.map(r => r.overallValue));
  const pipelineAvg = avg(responses.map(r => r.pipelineValue));
  const huddleAvg = avg(responses.map(r => r.huddleValue));

  const roleCounts = countBy(responses, r => r.role);
  const timeCounts = countBy(responses, r => r.timeInvestment);
  const timingCounts = countBy(responses, r => r.meetingTiming);

  // Flatten multi-selects
  const pipelineFlat = responses.flatMap(r => r.pipelineChanges);
  const huddleFlat = responses.flatMap(r => r.huddleChanges);
  const pipelineChangeCounts = countBy(pipelineFlat, x => x);
  const huddleChangeCounts = countBy(huddleFlat, x => x);

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
          Survey Results
        </div>
        <h1 className="brand-heading mt-3 text-3xl text-[color:var(--brand-primary-deep)]">Results Dashboard</h1>
        <p className="mt-3 text-[color:var(--brand-muted)]">
          Responses: <span className="font-semibold">{responses.length}</span> •
          Links used: <span className="font-semibold">{tokensUsed}</span> / {tokensTotal}
        </p>
        <div className="mt-4">
          <a
            href={`/api/admin/export?key=${encodeURIComponent(key)}`}
            className="inline-flex items-center rounded-xl bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Download CSV
          </a>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/80 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-sm text-[color:var(--brand-muted)]">Overall value (avg)</div>
            <div className="mt-1 text-2xl font-semibold">{overallAvg}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-sm text-[color:var(--brand-muted)]">Pipeline call (avg)</div>
            <div className="mt-1 text-2xl font-semibold">{pipelineAvg}</div>
          </div>
          <div className="rounded-xl bg-white/80 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-sm text-[color:var(--brand-muted)]">BD huddle (avg)</div>
            <div className="mt-1 text-2xl font-semibold">{huddleAvg}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Breakdowns</h2>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-sm font-semibold">Roles</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {roleCounts.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Time investment</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {timeCounts.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Meeting timing</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {timingCounts.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Pipeline changes (top picks)</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {pipelineChangeCounts.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>

          <div className="sm:col-span-2">
            <div className="text-sm font-semibold">Huddle changes (top picks)</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {huddleChangeCounts.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="brand-heading text-2xl text-[color:var(--brand-primary-deep)]">Written feedback</h2>
        <p className="mt-1 text-sm text-[color:var(--brand-muted)]">Most recent first.</p>

        <div className="mt-4 space-y-4">
          {responses.map(r => (
            <div key={r.id} className="rounded-xl bg-white/80 p-4 ring-1 ring-[color:var(--brand-line)]">
              <div className="text-xs text-[color:var(--brand-muted)]">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              {r.improveOneThing && (
                <div className="mt-2">
                  <div className="text-sm font-semibold">Improve one thing</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--brand-ink)]">{r.improveOneThing}</div>
                </div>
              )}
              {r.anythingElse && (
                <div className="mt-3">
                  <div className="text-sm font-semibold">Anything else</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--brand-ink)]">{r.anythingElse}</div>
                </div>
              )}
              {(!r.improveOneThing && !r.anythingElse) && (
                <div className="mt-2 text-sm text-[color:var(--brand-muted)]">No written feedback.</div>
              )}
            </div>
          ))}
          {responses.length === 0 && (
            <div className="text-sm text-[color:var(--brand-muted)]">No responses yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
