import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata = {
  title: "API Global Solutions Survey",
  description: "Anonymous meeting effectiveness survey by API Global Solutions"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} min-h-screen text-slate-950`}>
        <div className="page-shell">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            <header className="brand-frame mb-8 flex flex-col gap-5 overflow-hidden rounded-[2rem] px-5 py-5 sm:px-8 sm:py-7">
              <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/" className="flex items-center gap-4">
                  <div className="px-1 py-1">
                    <Image
                      src="/brand-logo.svg"
                      alt="API Global Solutions"
                      width={132}
                      height={68}
                      priority
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-accent)]">
                      API Global Solutions
                    </div>
                    <div className="brand-heading mt-1 text-2xl text-white sm:text-3xl">
                      Survey Portal
                    </div>
                  </div>
                </Link>

                <div className="max-w-md text-sm leading-6 text-slate-200">
                  Providing the best and most efficient layover experience for your crew and
                  passengers.
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-3xl">{children}</main>

            <footer className="mx-auto mt-10 max-w-3xl pb-4 text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Esteban Candamo. All rights reserved.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
