"use client";

import { useMemo, useState } from "react";
import { PIPELINE_CHANGE_OPTIONS, HUDDLE_CHANGE_OPTIONS } from "@/lib/survey";
import { Card, Button, SecondaryButton, Label, HelpText, ErrorText, Divider } from "@/components/ui";

function Stars({ value, onChange, name }) {
  return (
    <div className="mt-2 flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          aria-label={`${name} ${n}`}
          onClick={() => onChange(n)}
          className={
            "h-10 w-10 rounded-xl ring-1 ring-[color:var(--brand-line)] text-sm font-semibold transition " +
            (value === n
              ? "bg-[color:var(--brand-primary)] text-white ring-[color:var(--brand-primary)]"
              : "bg-white hover:bg-slate-50")
          }
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function CheckboxList({ options, selected, setSelected, max = 2 }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter(x => x !== opt));
      return;
    }
    if (selected.length >= max) return;
    setSelected([...selected, opt]);
  };

  return (
    <div className="mt-3 grid gap-2">
      {options.map(opt => {
        const checked = selected.includes(opt);
        const disabled = !checked && selected.length >= max;
        return (
          <label
            key={opt}
            className={
              "flex items-start gap-3 rounded-xl p-3 ring-1 ring-[color:var(--brand-line)] bg-white " +
              (disabled ? "opacity-60" : "hover:bg-slate-50")
            }
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(opt)}
              className="mt-1 h-4 w-4"
            />
            <div className="text-sm text-[color:var(--brand-ink)]">{opt}</div>
          </label>
        );
      })}
      <div className="text-sm text-[color:var(--brand-muted)]">Selected {selected.length} / {max}</div>
    </div>
  );
}

export default function SurveyForm({ token, alreadySubmitted }) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  const [role, setRole] = useState("");
  const [overallValue, setOverallValue] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [huddleValue, setHuddleValue] = useState(0);
  const [timeInvestment, setTimeInvestment] = useState("");
  const [pipelineChanges, setPipelineChanges] = useState([]);
  const [pipelineOther, setPipelineOther] = useState("");
  const [huddleChanges, setHuddleChanges] = useState([]);
  const [huddleOther, setHuddleOther] = useState("");
  const [meetingTiming, setMeetingTiming] = useState("");
  const [improveOneThing, setImproveOneThing] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  const needsPipelineOther = pipelineChanges.includes("Other (Provide Comment)");
  const needsHuddleOther = huddleChanges.includes("Other (Provide Comment)");

  const canSubmit = useMemo(() => {
    if (alreadySubmitted) return false;
    if (!role) return false;
    if (![1,2,3,4,5].includes(overallValue)) return false;
    if (![1,2,3,4,5].includes(pipelineValue)) return false;
    if (![1,2,3,4,5].includes(huddleValue)) return false;
    if (!timeInvestment) return false;
    if (pipelineChanges.length === 0) return false;
    if (huddleChanges.length === 0) return false;
    if (!meetingTiming) return false;
    if (needsPipelineOther && !pipelineOther.trim()) return false;
    if (needsHuddleOther && !huddleOther.trim()) return false;
    return true;
  }, [
    alreadySubmitted, role, overallValue, pipelineValue, huddleValue,
    timeInvestment, pipelineChanges, pipelineOther, huddleChanges, huddleOther, meetingTiming,
    needsPipelineOther, needsHuddleOther
  ]);

  const submit = async () => {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch(`/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          role,
          overallValue,
          pipelineValue,
          huddleValue,
          timeInvestment,
          pipelineChanges,
          pipelineOther,
          huddleChanges,
          huddleOther,
          meetingTiming,
          improveOneThing,
          anythingElse
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit.");
      setStatus("saved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setStatus("error");
      setError(e.message || "Something went wrong.");
    }
  };

  if (alreadySubmitted) {
    return (
      <Card>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
          Submission Closed
        </div>
        <h1 className="brand-heading mt-3 text-3xl text-[color:var(--brand-primary-deep)]">
          Thanks, this survey has already been completed
        </h1>
        <p className="mt-3 text-[color:var(--brand-muted)]">
          This link has already been used to submit a response.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(39,59,110,0.08),rgba(120,188,67,0.08))] p-5 ring-1 ring-[color:var(--brand-line)]">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
          API Global Solutions
        </div>
        <h1 className="brand-heading mt-3 text-3xl text-[color:var(--brand-primary-deep)]">
          Meeting Effectiveness Survey
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--brand-muted)]">
          Anonymous feedback. Expected completion time: 3 to 5 minutes.
        </p>
      </div>

      {status === "saved" && (
        <div className="mt-4 rounded-xl bg-green-50 p-4 ring-1 ring-green-200">
          <div className="font-semibold text-green-900">Submitted — thank you! ✅</div>
          <div className="text-sm text-green-800">You can close this tab.</div>
        </div>
      )}
      {status === "error" && error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
          <div className="font-semibold text-red-900">Couldn’t submit</div>
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <Divider />

      <div className="space-y-7">

        <section>
          <Label>1) Role Identification</Label>
          <HelpText>Which function best describes your primary role?</HelpText>
          <select
            className="mt-2 w-full rounded-xl border border-[color:var(--brand-line)] bg-white px-3 py-2 text-sm text-[color:var(--brand-ink)]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select…</option>
            <option>Sales Rep</option>
            <option>Marketing</option>
            <option>Sales Operations</option>
            <option>Other</option>
          </select>
        </section>

        <section>
          <Label>2) Overall Meeting Value</Label>
          <HelpText>Overall, how valuable are our two standing meetings (Pipeline + BD Huddle)?</HelpText>
          <Stars name="overallValue" value={overallValue} onChange={setOverallValue} />
          <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
            1 = Lowest · 5 = Highest
          </div>
        </section>

        <section>
          <Label>3) Pipeline Call Value</Label>
          <HelpText>How valuable is the current 1.5-hour Pipeline Call to you?</HelpText>
          <Stars name="pipelineValue" value={pipelineValue} onChange={setPipelineValue} />
          <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
            1 = Lowest · 5 = Highest
          </div>
        </section>

        <section>
          <Label>4) BD Huddle Value</Label>
          <HelpText>How valuable is the current 1-hour BD Huddle to you?</HelpText>
          <Stars name="huddleValue" value={huddleValue} onChange={setHuddleValue} />
          <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
            1 = Lowest · 5 = Highest
          </div>
        </section>

        <section>
          <Label>5) Time Investment Assessment</Label>
          <HelpText>Do you believe the current total meeting time (2.5 hours per week) is:</HelpText>
          <div className="mt-3 grid gap-2">
            {["Too much time", "Slightly too much time", "About right", "Too little time"].map(opt => (
              <label key={opt} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[color:var(--brand-line)] hover:bg-slate-50">
                <input
                  type="radio"
                  name="timeInvestment"
                  value={opt}
                  checked={timeInvestment === opt}
                  onChange={() => setTimeInvestment(opt)}
                  className="h-4 w-4"
                />
                <div className="text-sm text-[color:var(--brand-ink)]">{opt}</div>
              </label>
            ))}
          </div>
        </section>

        <section>
          <Label>6) Pipeline Call – What Should Change? (Select up to 2)</Label>
          <CheckboxList options={PIPELINE_CHANGE_OPTIONS} selected={pipelineChanges} setSelected={setPipelineChanges} max={2} />
          {needsPipelineOther && (
            <div className="mt-3">
              <Label>Pipeline “Other” comment</Label>
              <textarea
                className="mt-2 w-full rounded-xl border border-[color:var(--brand-line)] bg-white px-3 py-2 text-sm text-[color:var(--brand-ink)]"
                rows={3}
                value={pipelineOther}
                onChange={(e) => setPipelineOther(e.target.value)}
                placeholder="Type your comment…"
              />
            </div>
          )}
        </section>

        <section>
          <Label>7) BD Huddle – What Should Change? (Select up to 2)</Label>
          <CheckboxList options={HUDDLE_CHANGE_OPTIONS} selected={huddleChanges} setSelected={setHuddleChanges} max={2} />
          {needsHuddleOther && (
            <div className="mt-3">
              <Label>Huddle “Other” comment</Label>
              <textarea
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                rows={3}
                value={huddleOther}
                onChange={(e) => setHuddleOther(e.target.value)}
                placeholder="Type your comment…"
              />
            </div>
          )}
        </section>

        <section>
          <Label>8) Meeting Timing</Label>
          <HelpText>Does the current meeting timing work well for you?</HelpText>
          <div className="mt-3 grid gap-2">
            {["Works well", "Somewhat challenging", "Very challenging"].map(opt => (
              <label key={opt} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[color:var(--brand-line)] hover:bg-slate-50">
                <input
                  type="radio"
                  name="meetingTiming"
                  value={opt}
                  checked={meetingTiming === opt}
                  onChange={() => setMeetingTiming(opt)}
                  className="h-4 w-4"
                />
                <div className="text-sm text-[color:var(--brand-ink)]">{opt}</div>
              </label>
            ))}
          </div>
        </section>

        <section>
          <Label>9) If We Could Improve One Thing…</Label>
          <HelpText>If we could improve just one thing about our current meeting cadence or structure, what would it be?</HelpText>
          <textarea
            className="mt-2 w-full rounded-xl border border-[color:var(--brand-line)] bg-white px-3 py-2 text-sm text-[color:var(--brand-ink)]"
            rows={4}
            value={improveOneThing}
            onChange={(e) => setImproveOneThing(e.target.value)}
            placeholder="Type your response…"
          />
        </section>

        <section>
          <Label>10) Anything Else?</Label>
          <HelpText>Any additional feedback, ideas, or suggestions?</HelpText>
          <textarea
            className="mt-2 w-full rounded-xl border border-[color:var(--brand-line)] bg-white px-3 py-2 text-sm text-[color:var(--brand-ink)]"
            rows={4}
            value={anythingElse}
            onChange={(e) => setAnythingElse(e.target.value)}
            placeholder="Type your response…"
          />
        </section>

      </div>

      <Divider />

      {!canSubmit && status !== "saved" && (
        <ErrorText>Please complete required fields (and “Other” comments if selected).</ErrorText>
      )}

      <div className="mt-4 flex gap-3">
        <Button type="button" disabled={!canSubmit || status === "saving" || status === "saved"} onClick={submit}>
          {status === "saving" ? "Submitting…" : "Submit"}
        </Button>
        <SecondaryButton
          type="button"
          onClick={() => window.location.reload()}
          disabled={status === "saving"}
        >
          Reset
        </SecondaryButton>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[color:var(--brand-muted)]">
        This link is single-use to ensure one response per person.
      </p>
    </Card>
  );
}
