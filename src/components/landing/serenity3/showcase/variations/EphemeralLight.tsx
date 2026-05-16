"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function EphemeralLight() {
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", background: "#fefefe", color: "#2a2a2a" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {/* Subtle aurora gradient */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(200,190,230,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(180,200,230,0.15) 0%, transparent 40%), linear-gradient(180deg, #fefefe 0%, #f5f0fb 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800, padding: "0 32px" }}>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 200, lineHeight: 1.1, letterSpacing: "0.15em", color: "rgba(42,42,42,0.25)", marginBottom: 32, textTransform: "uppercase" }}>
            SERENITY
          </h1>
          <p style={{ fontSize: 18, fontWeight: 300, lineHeight: 2, color: "rgba(42,42,42,0.4)", maxWidth: 500, margin: "0 auto 56px", letterSpacing: "0.03em" }}>
            Le soin juste, pour votre corps. Un espace de silence, de lumière et d'allègement.
          </p>
          <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", borderRadius: 999, border: "1px solid rgba(180,170,200,0.3)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", color: "rgba(42,42,42,0.5)", fontSize: 13, fontWeight: 400, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase", transition: "all 0.5s" }}>
            Réserver
          </Link>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "160px 48px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 100, alignItems: "center" }}>
          {[
            { t: "Soulager les tensions", d: "Le soin dénoue les zones crispées et réduit les douleurs." },
            { t: "Mobilité retrouvée", d: "Le corps gagne en souplesse, les gestes redeviennent fluides." },
            { t: "Moins de stress", d: "La respiration ralentit, le stress baisse, la récupération s'approfondit." },
          ].map((b, i) => (
            <div key={i} style={{ textAlign: "center", maxWidth: 400 }}>
              <div style={{ fontSize: 60, fontWeight: 100, color: "rgba(180,170,200,0.3)", marginBottom: 16, letterSpacing: "-0.02em" }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.06em", marginBottom: 12, color: "rgba(42,42,42,0.6)" }}>{b.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 2, color: "rgba(42,42,42,0.35)", fontWeight: 300 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES ---- */}
      <section style={{ padding: "80px 48px 160px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 200, letterSpacing: "0.1em", color: "rgba(42,42,42,0.3)", textTransform: "uppercase" }}>Les soins</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 48 }}>
          {SERVICES.map(s => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ textDecoration: "none", color: "inherit", textAlign: "center", transition: "all 0.5s" }}>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <div style={{ width: 80, height: 80, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,190,230,0.2) 0%, transparent 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 200, color: "rgba(42,42,42,0.2)" }}>{s.id}</span>
                </div>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 400, letterSpacing: "0.04em", marginBottom: 6, color: "rgba(42,42,42,0.6)" }}>{s.name}</h3>
              <p style={{ fontSize: 12, color: "rgba(42,42,42,0.3)", fontWeight: 300 }}>{s.displayDuration} · {s.price} CHF</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 120px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 200, letterSpacing: "0.1em", color: "rgba(42,42,42,0.3)", textTransform: "uppercase" }}>Questions</h2>
        </div>
        {FAQ.map((f, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(42,42,42,0.06)", padding: "32px 0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 400, marginBottom: 10, color: "rgba(42,42,42,0.5)" }}>{f.q}</h3>
            <p style={{ fontSize: 13, lineHeight: 1.9, color: "rgba(42,42,42,0.3)", fontWeight: 300 }}>{f.a}</p>
          </div>
        ))}
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "60px 48px", textAlign: "center", color: "rgba(42,42,42,0.15)", fontSize: 11, fontWeight: 300, letterSpacing: "0.15em" }}>
        © 2024 SERENITY RELAX THERAPY · LIGHT · GENÈVE
      </footer>
    </div>
  );
}
