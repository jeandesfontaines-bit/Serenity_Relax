"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";

const NAV_LINKS = [
  { label: "Sessions", href: "#sessions" },
  { label: "Sanctuaire", href: "#sanctuary" },
  { label: "Journal", href: "#journal" },
  { label: "FAQ", href: "#atelier" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { openModal } = useBooking();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
      className={`absolute inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-foreground/8"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-4 md:px-10 lg:px-14">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight text-foreground">
            SERENITY RELAX THERAPY
          </span>
          <span className="signature-font hidden text-sm italic tracking-wide leading-none text-foreground/55 lg:inline">
            by João
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={isHome ? link.href : `/${link.href}`}
              onClick={handleAnchor(link.href)}
              className="text-base font-medium tracking-tight text-foreground/70 transition-colors duration-300 hover:text-foreground editorial-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal(null)}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-6 py-3 text-base font-semibold tracking-tight text-white transition-all duration-300 hover:bg-[var(--off-black)]"
          >
            Réserver
          </button>
          <Link
            href="/login"
            className="hidden md:inline-flex rounded-full border border-foreground/15 px-6 py-3 text-base font-medium text-foreground transition-all duration-300 hover:bg-foreground/5"
          >
            Connexion
          </Link>
          <button
            className="md:hidden flex flex-col gap-1.5"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-foreground/8 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-5 px-6 py-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={isHome ? link.href : `/${link.href}`}
                onClick={(e) => { handleAnchor(link.href)(e); setOpen(false); }}
                className="text-base font-medium tracking-tight text-foreground"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                openModal(null);
              }}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--orange)] px-6 py-3 text-base font-semibold tracking-tight text-white"
            >
              Réserver
            </button>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full border border-foreground/15 px-6 py-3 text-base font-medium text-foreground"
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
