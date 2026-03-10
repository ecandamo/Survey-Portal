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

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function Bars({ items, total, emptyLabel = "No data yet." }) {
  if (!items.length) {
    return <div className="text-sm text-[color:var(--brand-muted)]">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {items.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[color:var(--brand-ink)]">{label}</span>
            <span className="font-semibold text-[color:var(--brand-primary-deep)]">
              {value} ({pct(value, total)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-[color:var(--brand-line)]">
            <div
              className="h-full rounded-full bg-[color:var(--brand-primary)]"
              style={{ width: `${pct(value, total)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizeText(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function detectTopic(text) {
  const t = normalizeText(text);
  if (!t) return "Other";

  const topicMatchers = [
    {
      topic: "Positive feedback",
      re: /\b(appreciate|appreciated|thanks|thank you|good effort|helpful)\b/
    },
    {
      topic: "Duration / shorter meetings",
      re: /\b(short|shorter|shorten|too long|length|duration|trim|reduce|cut down|30 min|45 min|1 hour)\b/
    },
    {
      topic: "Agenda and focus",
      re: /\b(agenda|focus|focused|structure|organized|objective|objectives|stay on topic|off topic|topic|topics)\b/
    },
    {
      topic: "Participation and engagement",
      re: /\b(participat|engag|interaction|everyone speak|involve|silent|discussion|dynamic)\b/
    },
    {
      topic: "Meeting consolidation",
      re: /\b(combine|combined|merge|merged|consolidat|single meeting|one meeting|dam)\b/
    },
    {
      topic: "Scheduling / timing",
      re: /\b(time|timing|schedule|earlier|later|calendar|conflict|time zone|timezone|cadence|frequency|weekly|biweekly|cancel)\b/
    },
    {
      topic: "Preparation and follow-up",
      re: /\b(prep|prepar|pre-read|read ahead|follow up|follow-up|notes|recap|action item|next step)\b/
    },
    {
      topic: "Pipeline quality and deal review",
      re: /\b(pipeline|deal|opportunit|forecast|stage|qualification|close plan|account)\b/
    },
    {
      topic: "Data / tooling / reporting",
      re: /\b(data|dashboard|report|crm|salesforce|hubspot|metrics|numbers|visibility)\b/
    },
    {
      topic: "Leadership / ownership",
      re: /\b(leader|leadership|owner|ownership|facilitat|moderator|manager|accountability)\b/
    }
  ];

  for (const matcher of topicMatchers) {
    if (matcher.re.test(t)) return matcher.topic;
  }
  return "Other";
}

function countSelectionsWithOtherTopics(responses, selectionField, otherField) {
  const counts = new Map();
  let total = 0;

  for (const response of responses) {
    const selections = response[selectionField] || [];
    for (const selection of selections) {
      total += 1;
      if (selection === "Other (Provide Comment)") {
        const otherText = (response[otherField] || "").trim();
        const topic = otherText ? `Other: ${detectTopic(otherText)}` : "Other (Provide Comment)";
        counts.set(topic, (counts.get(topic) || 0) + 1);
      } else {
        counts.set(selection, (counts.get(selection) || 0) + 1);
      }
    }
  }

  return {
    total,
    items: Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  };
}

function groupCommentTopics(comments) {
  const counts = new Map();
  for (const raw of comments) {
    const text = (raw || "").trim();
    if (!text) continue;
    const topic = detectTopic(text);
    counts.set(topic, (counts.get(topic) || 0) + 1);
  }

  return {
    total: Array.from(counts.values()).reduce((sum, n) => sum + n, 0),
    items: Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  };
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
  const pipelineSelectionData = countSelectionsWithOtherTopics(responses, "pipelineChanges", "pipelineOther");
  const huddleSelectionData = countSelectionsWithOtherTopics(responses, "huddleChanges", "huddleOther");
  const topPipelineChanges = pipelineSelectionData.items.slice(0, 5);
  const topHuddleChanges = huddleSelectionData.items.slice(0, 5);
  const topRoles = roleCounts.slice(0, 4);
  const topTime = timeCounts.slice(0, 4);
  const totalScored = responses.length * 10;
  const overallScorePct = pct(Math.round(overallAvg * responses.length), totalScored);
  const pipelineScorePct = pct(Math.round(pipelineAvg * responses.length), totalScored);
  const huddleScorePct = pct(Math.round(huddleAvg * responses.length), totalScored);
  const allOpenComments = responses.flatMap((r) => [r.pipelineOther, r.huddleOther, r.improveOneThing, r.anythingElse]);
  const commentTopics = groupCommentTopics(allOpenComments);
  const topCommentTopics = commentTopics.items.slice(0, 6);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
              Report Preview
            </div>
            <h2 className="brand-heading mt-2 text-2xl text-[color:var(--brand-primary-deep)]">
              Decision-ready survey summary
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-base font-semibold">Summary</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[color:var(--brand-primary)]/8 p-3">
                <div className="text-sm text-[color:var(--brand-muted)]">Overall value index</div>
                <div className="mt-1 text-2xl font-semibold text-[color:var(--brand-primary-deep)]">{overallAvg}/10</div>
                <div className="mt-2 h-2 rounded-full bg-[color:var(--brand-line)]">
                  <div className="h-full rounded-full bg-[color:var(--brand-primary)]" style={{ width: `${overallScorePct}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--brand-primary)]/8 p-3">
                <div className="text-sm text-[color:var(--brand-muted)]">Pipeline call score</div>
                <div className="mt-1 text-2xl font-semibold text-[color:var(--brand-primary-deep)]">{pipelineAvg}/10</div>
                <div className="mt-2 h-2 rounded-full bg-[color:var(--brand-line)]">
                  <div className="h-full rounded-full bg-[color:var(--brand-primary)]" style={{ width: `${pipelineScorePct}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--brand-primary)]/8 p-3">
                <div className="text-sm text-[color:var(--brand-muted)]">BD huddle score</div>
                <div className="mt-1 text-2xl font-semibold text-[color:var(--brand-primary-deep)]">{huddleAvg}/10</div>
                <div className="mt-2 h-2 rounded-full bg-[color:var(--brand-line)]">
                  <div className="h-full rounded-full bg-[color:var(--brand-primary)]" style={{ width: `${huddleScorePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-base font-semibold">Key Findings</div>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Sorted bars with one takeaway caption under each chart.
            </p>
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-[color:var(--brand-ink)]">Top suggested pipeline changes</div>
              <div className="mb-1 text-xs text-[color:var(--brand-muted)]">
                100% = {pipelineSelectionData.total} total selections (including “Other” comments)
              </div>
              <Bars items={topPipelineChanges} total={pipelineSelectionData.total} emptyLabel="No pipeline selections yet." />
            </div>
            <div className="mt-5 border-t border-[color:var(--brand-line)] pt-4">
              <div className="mb-2 text-sm font-semibold text-[color:var(--brand-ink)]">Top suggested huddle changes</div>
              <div className="mb-1 text-xs text-[color:var(--brand-muted)]">
                100% = {huddleSelectionData.total} total selections (including “Other” comments)
              </div>
              <Bars items={topHuddleChanges} total={huddleSelectionData.total} emptyLabel="No huddle selections yet." />
            </div>
          </div>

          <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-[color:var(--brand-line)]">
            <div className="text-base font-semibold">Appendix / Segments</div>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Compact subgroup cuts for likely follow-up questions.
            </p>
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-[color:var(--brand-ink)]">Role split</div>
              <Bars items={topRoles} total={responses.length} emptyLabel="No role data yet." />
            </div>
            <div className="mt-5 border-t border-[color:var(--brand-line)] pt-4">
              <div className="mb-2 text-sm font-semibold text-[color:var(--brand-ink)]">Time investment split</div>
              <Bars items={topTime} total={responses.length} emptyLabel="No time investment data yet." />
            </div>
            <div className="mt-5 border-t border-[color:var(--brand-line)] pt-4">
              <div className="mb-2 text-sm font-semibold text-[color:var(--brand-ink)]">Comment themes</div>
              <div className="mb-1 text-xs text-[color:var(--brand-muted)]">
                100% = {commentTopics.total} total comments (including “Other” comments)
              </div>
              <Bars items={topCommentTopics} total={commentTopics.total} emptyLabel="No written comments yet." />
            </div>
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
              {pipelineSelectionData.items.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
            </ul>
          </div>

          <div className="sm:col-span-2">
            <div className="text-sm font-semibold">Huddle changes (top picks)</div>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-ink)]">
              {huddleSelectionData.items.map(([k,v]) => <li key={k}>{k}: <span className="font-semibold">{v}</span></li>)}
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
