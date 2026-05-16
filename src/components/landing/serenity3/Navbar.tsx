"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Sessions", href: "#sessions" },
  { label: "Bienfaits", href: "#about" },
  { label: "FAQ", href: "#atelier" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const handleAnchor = (href: string) => (e: React.MouseEvent) => {
    if (!isHome) {
      e.preventDefault();
      router.push("/");
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav
      className="relative z-50 border-b border-[rgba(21,56,57,0.08)] bg-white shadow-[0_10px_30px_rgba(21,32,35,0.06)]"
    >
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-3.5 md:px-10 lg:px-12">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="landing-type-h5 landing-text-high text-[15px] tracking-[0.03em] md:text-[16px] lg:text-[17px]">
            SERENITY RELAX THERAPY
          </span>
          <span className="signature-font landing-text-soft hidden text-[1.55rem] leading-none lg:inline">
            by João
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={isHome ? link.href : `/${link.href}`}
              onClick={handleAnchor(link.href)}
              className="landing-text-soft editorial-link text-[14px] font-medium tracking-tight transition-colors duration-300 hover:text-[var(--off-black)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-5 py-2.5 text-[13px] font-semibold tracking-tight text-white shadow-[0_12px_26px_rgba(241,102,77,0.18)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[var(--teal-deep)]"
          >
            Réserver
          </Link>
          <Link
            href="/login"
            className="landing-border-tint landing-text-high hidden md:inline-flex rounded-full border bg-white/55 px-5 py-2.5 text-[13px] font-medium transition-all duration-300 hover:bg-white/82"
          >
            Connexion
          </Link>
          <button
            className="md:hidden flex flex-col gap-1.5"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className={`block h-px w-6 bg-[var(--off-black)] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-[var(--off-black)] transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-[var(--off-black)] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[rgba(21,56,57,0.08)] bg-white md:hidden">
          <div className="flex flex-col gap-5 px-6 py-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={isHome ? link.href : `/${link.href}`}
                onClick={(e) => { handleAnchor(link.href)(e); setOpen(false); }}
                className="landing-text-high text-base font-medium tracking-tight"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--orange)] px-6 py-3 text-base font-semibold tracking-tight text-white shadow-[0_12px_26px_rgba(241,102,77,0.18)]"
            >
              Réserver
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="landing-border-soft landing-text-high mt-2 inline-flex items-center justify-center rounded-full border px-6 py-3 text-base font-medium"
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
