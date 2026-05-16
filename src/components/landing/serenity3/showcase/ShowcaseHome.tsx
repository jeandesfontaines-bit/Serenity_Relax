"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import VariantSwitcher from "./VariantSwitcher";
import { LandingVariant } from "../types";

// Lazy-load each variation for perf
const DefaultHome = dynamic(() => import("../Home"), { ssr: false });
const AlpineClinic = dynamic(() => import("./variations/AlpineClinic"), { ssr: false });
const SensualCocoon = dynamic(() => import("./variations/SensualCocoon"), { ssr: false });
const EditorialMonolith = dynamic(() => import("./variations/EditorialMonolith"), { ssr: false });
const KineticFlow = dynamic(() => import("./variations/KineticFlow"), { ssr: false });
const ZenBrutalist = dynamic(() => import("./variations/ZenBrutalist"), { ssr: false });
const EphemeralLight = dynamic(() => import("./variations/EphemeralLight"), { ssr: false });
const HeritageApothecary = dynamic(() => import("./variations/HeritageApothecary"), { ssr: false });
const NocturnalSanctuary = dynamic(() => import("./variations/NocturnalSanctuary"), { ssr: false });
const BentoGrid = dynamic(() => import("./variations/BentoGrid"), { ssr: false });

const VARIANT_COMPONENTS: Record<LandingVariant, React.ComponentType> = {
  default: () => <DefaultHome variant="default" />,
  immersive: () => <DefaultHome variant="immersive" />,
  alpine: AlpineClinic,
  cocoon: SensualCocoon,
  editorial: EditorialMonolith,
  concierge: () => <DefaultHome variant="concierge" />,
  kinetic: KineticFlow,
  zen: ZenBrutalist,
  ephemeral: EphemeralLight,
  heritage: HeritageApothecary,
  nocturnal: NocturnalSanctuary,
  bento: BentoGrid,
};

export default function ShowcaseHome() {
  const [activeVariant, setActiveVariant] = useState<LandingVariant>("default");

  const VariantComponent = VARIANT_COMPONENTS[activeVariant];

  return (
    <div className="relative">
      {/* Active variant */}
      <div key={activeVariant} style={{ animation: "fadeInVariant 0.5s ease-out" }}>
        <VariantComponent />
      </div>

      {/* Switcher */}
      <VariantSwitcher active={activeVariant} onChange={setActiveVariant} />

      <style>{`
        @keyframes fadeInVariant {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
