"use client";

import { LandingVariant } from "../types";

const VARIANT_META: Record<LandingVariant, { label: string; color: string }> = {
  default: { label: "Signature", color: "#B87355" },
  immersive: { label: "Immersive", color: "#153839" },
  alpine: { label: "Alpine Clinic", color: "#6B8FA3" },
  cocoon: { label: "Sensual Cocoon", color: "#C48B6C" },
  editorial: { label: "Editorial", color: "#3A3A3A" },
  concierge: { label: "Concierge", color: "#F1664D" },
  kinetic: { label: "Kinetic Flow", color: "#2246C8" },
  zen: { label: "Zen Brutalist", color: "#556B2F" },
  ephemeral: { label: "Ephemeral Light", color: "#B8A9C9" },
  heritage: { label: "Heritage", color: "#5C3A21" },
  nocturnal: { label: "Nocturnal", color: "#1A1A2E" },
  bento: { label: "Bento Grid", color: "#153839" },
};

export default function VariantSwitcher({
  active,
  onChange,
}: {
  active: LandingVariant;
  onChange: (v: LandingVariant) => void;
}) {
  const variants = Object.entries(VARIANT_META) as [LandingVariant, typeof VARIANT_META[LandingVariant]][];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto mb-5 flex items-center gap-1 rounded-2xl border border-white/20 bg-[#0a0a0a]/90 px-2 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        style={{ maxWidth: "calc(100vw - 32px)", overflowX: "auto" }}
      >
        {variants.map(([key, meta]) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="group relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-semibold tracking-wide transition-all duration-300"
              style={{
                background: isActive ? meta.color : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full transition-all duration-300"
                style={{
                  background: isActive ? "#fff" : meta.color,
                  opacity: isActive ? 1 : 0.6,
                  boxShadow: isActive ? `0 0 8px ${meta.color}` : "none",
                }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
