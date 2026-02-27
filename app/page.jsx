import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function Home() {
  return (
    <Card className="overflow-hidden">
      <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(39,59,110,0.08),rgba(120,188,67,0.08))] p-6 ring-1 ring-[color:var(--brand-line)]">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
          Internal Feedback Survey
        </div>
        <h1 className="brand-heading mt-3 text-4xl text-[color:var(--brand-primary-deep)]">
          Sales and Marketing meeting effectiveness
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--brand-muted)]">
          API Global Solutions uses this survey to gather structured, anonymous feedback on
          recurring meeting cadence, value, and opportunities to improve execution.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-[color:var(--brand-line)]">
          <div className="text-sm font-semibold text-[color:var(--brand-ink)]">How participants join</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--brand-muted)]">
            Each participant receives a unique survey link ending in their token. Links are
            single-use so each response is tied to one invitation.
          </p>
        </div>
        <div className="rounded-2xl bg-[color:var(--brand-primary-deep)] p-5 text-white ring-1 ring-white/10">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-accent)]">
            Example
          </div>
          <p className="mt-2 text-sm text-slate-200">
            Respondents open their assigned URL:
          </p>
          <p className="mt-3 break-all rounded-xl bg-white/10 px-4 py-3 font-mono text-sm text-white">
            /s/ABC123...
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/admin">
          <Button type="button">Admin Dashboard</Button>
        </Link>
      </div>
    </Card>
  );
}
