import { Card } from "@/components/ui";
import AdminLogin from "./login";

export default function AdminPage() {
  return (
    <Card>
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-primary)]">
        Restricted Access
      </div>
      <h1 className="brand-heading mt-3 text-3xl text-[color:var(--brand-primary-deep)]">
        API Global Solutions admin dashboard
      </h1>
      <p className="mt-3 text-[color:var(--brand-muted)]">
        Enter the admin password to review response rates, scores, and written feedback.
      </p>
      <div className="mt-6">
        <AdminLogin />
      </div>
    </Card>
  );
}
