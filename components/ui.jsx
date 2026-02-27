export function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-[1.75rem] border border-[color:var(--brand-line)] bg-[color:var(--brand-surface)] p-6 " +
        "shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 " +
        className
      }
    >
      {children}
    </div>
  );
}

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold " +
        "bg-[color:var(--brand-primary)] text-white hover:bg-[color:var(--brand-primary-deep)] disabled:opacity-50 disabled:cursor-not-allowed " +
        "transition " + className
      }
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold " +
        "bg-white/80 text-[color:var(--brand-primary)] ring-1 ring-[color:var(--brand-line)] hover:bg-white " +
        "transition " + className
      }
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({ children }) {
  return <div className="text-sm font-semibold text-[color:var(--brand-ink)]">{children}</div>;
}

export function HelpText({ children }) {
  return <div className="mt-1 text-sm text-[color:var(--brand-muted)]">{children}</div>;
}

export function ErrorText({ children }) {
  return <div className="mt-1 text-sm text-red-600">{children}</div>;
}

export function Divider() {
  return <div className="my-6 h-px bg-[color:var(--brand-line)]" />;
}
