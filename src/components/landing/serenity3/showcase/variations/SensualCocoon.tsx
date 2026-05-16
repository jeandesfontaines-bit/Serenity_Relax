"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function SensualCocoon() {
  return (
    <div style={{ fontFamily: "'Georgia', 'Palatino', serif", background: "#f5ebe0", color: "#3d2b1f" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {/* Warm radial gradients */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(196,139,108,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(180,120,80,0.2) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/images/joao-collage.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, filter: "sepia(0.5) blur(2px)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 700, padding: "0 32px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#b08968", marginBottom: 32, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
            ✦ Un retour à soi ✦
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#3d2b1f", marginBottom: 32 }}>
            <em style={{ fontStyle: "italic", fontWeight: 300 }}>Le toucher</em>
            <br />qui libère.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.9, color: "#7c6a58", maxWidth: 480, margin: "0 auto 48px", fontStyle: "italic" }}>
            Un cocon de chaleur, de douceur et de silence où le corps retrouve sa mémoire du confort.
          </p>
          <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 44px", borderRadius: 999, background: "#b08968", color: "#fff", fontSize: 14, fontWeight: 500, letterSpacing: "0.05em", textDecoration: "none", boxShadow: "0 20px 50px rgba(176,137,104,0.35)", transition: "all 0.6s ease" }}>
            Réserver un soin
          </Link>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "120px 48px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#b08968", marginBottom: 16, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
          Bienfaits
        </div>
        <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.1, marginBottom: 64 }}>
          <em style={{ fontStyle: "italic" }}>Ce que</em> le corps retient.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {[
            { t: "Soulager les tensions", d: "Le soin dénoue les zones crispées, comme un souffle chaud sur les muscles." },
            { t: "Mobilité retrouvée", d: "Le corps s'ouvre, les gestes redeviennent fluides et sans contrainte." },
            { t: "Moins de stress", d: "La respiration ralentit, le calme s'installe, profondément." },
          ].map((b, i) => (
            <div key={i} style={{ padding: "40px 48px", borderRadius: 28, background: "rgba(255,255,255,0.6)", boxShadow: "0 8px 40px rgba(176,137,104,0.08)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 32, fontWeight: 300, color: "#b08968", marginBottom: 8, fontStyle: "italic" }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{b.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#7c6a58", fontStyle: "italic" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES (Horizontal Carousel) ---- */}
      <section style={{ padding: "80px 0 120px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#b08968", marginBottom: 16, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
            Les soins
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 400, lineHeight: 1.1, marginBottom: 48 }}>
            <em>Huit rituels,</em> une intention.
          </h2>
        </div>
        <div style={{ display: "flex", gap: 24, overflowX: "auto", padding: "0 48px 24px", scrollSnapType: "x mandatory" }}>
          {SERVICES.map(s => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ flex: "0 0 280px", scrollSnapAlign: "start", borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 12px 40px rgba(176,137,104,0.1)", textDecoration: "none", color: "inherit", transition: "transform 0.6s ease" }}>
              <div style={{ height: 200, overflow: "hidden" }}>
                <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(0.15) saturate(1.2)", transition: "transform 1s ease" }} />
              </div>
              <div style={{ padding: "24px 24px 28px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#b08968", marginBottom: 8, fontFamily: "sans-serif", fontWeight: 600, textTransform: "uppercase" }}>{s.displayDuration} · {s.price} CHF</div>
                <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{s.name}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#7c6a58", fontStyle: "italic" }}>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 100px", background: "rgba(255,255,255,0.5)", borderRadius: "48px 48px 0 0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, marginBottom: 48, fontStyle: "italic" }}>
            Quelques mots avant le soin.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "left" }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ padding: "28px 32px", borderRadius: 20, background: "#f5ebe0", border: "1px solid rgba(176,137,104,0.12)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "#3d2b1f" }}>{f.q}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#7c6a58", fontStyle: "italic" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "48px 48px", background: "#3d2b1f", color: "rgba(255,255,255,0.4)", textAlign: "center", fontSize: 11, letterSpacing: "0.12em", fontFamily: "sans-serif" }}>
        © 2024 SERENITY RELAX THERAPY · LE COCON · GENÈVE
      </footer>
    </div>
  );
}
