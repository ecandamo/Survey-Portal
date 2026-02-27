"use client";

import { useState } from "react";
import { Button, ErrorText, Label } from "@/components/ui";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      window.location.href = "/admin/results?key=" + encodeURIComponent(data.key);
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Admin password</Label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[color:var(--brand-line)] bg-white px-3 py-2 text-sm text-[color:var(--brand-ink)]"
          placeholder="Enter password…"
        />
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="button" onClick={submit} disabled={loading || !password}>
        {loading ? "Checking…" : "View results"}
      </Button>
    </div>
  );
}
