"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function HeritageApothecary() {
  return (
    <div style={{ fontFamily: "'Playfair Display', 'Georgia', serif", background: "#f9f5f0", color: "#2b1810" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#0b2618" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "repeating-linear-gradient(45deg, rgba(200,170,120,0.1) 0, rgba(200,170,120,0.1) 1px, transparent 1px, transparent 20px)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 700, padding: "0 32px" }}>
          {/* Ornament */}
          <div style={{ fontSize: 11, letterSpacing: "0.35em", color: "#c8a878", marginBottom: 24, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
            — EST. GENÈVE —
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5rem)", fontWeight: 700, lineHeight: 1.05, color: "#f9f5f0", letterSpacing: "-0.01em", marginBottom: 20 }}>
            Serenity<br />Relax Therapy
          </h1>
          <div style={{ width: 60, height: 1, background: "#c8a878", margin: "0 auto 24px" }} />
          <p style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(249,245,240,0.6)", maxWidth: 460, margin: "0 auto 48px", fontStyle: "italic" }}>
            L'art du massage hérité des traditions les plus anciennes, exécuté avec la précision d'un artisan du luxe.
          </p>
          <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 40px", border: "1px solid #c8a878", background: "transparent", color: "#c8a878", fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", fontFamily: "sans-serif", transition: "all 0.3s" }}>
            RÉSERVER UN SOIN
          </Link>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#c8a878", marginBottom: 16, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
            VERTUS
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1 }}>
            Les bienfaits du <em style={{ fontStyle: "italic", fontWeight: 400 }}>toucher.</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
          {[
            { t: "Soulager les tensions", d: "Le soin dénoue les zones crispées et réduit les douleurs musculaires." },
            { t: "Mobilité retrouvée", d: "Le corps gagne en souplesse, les gestes redeviennent fluides." },
            { t: "Moins de stress", d: "La respiration ralentit, le calme intérieur se restaure." },
          ].map((b, i) => (
            <div key={i} style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(200,168,120,0.2)", position: "relative" }}>
              {/* Corner ornaments */}
              <div style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: "1px solid #c8a878", borderLeft: "1px solid #c8a878" }} />
              <div style={{ position: "absolute", top: -1, right: -1, width: 12, height: 12, borderTop: "1px solid #c8a878", borderRight: "1px solid #c8a878" }} />
              <div style={{ position: "absolute", bottom: -1, left: -1, width: 12, height: 12, borderBottom: "1px solid #c8a878", borderLeft: "1px solid #c8a878" }} />
              <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderBottom: "1px solid #c8a878", borderRight: "1px solid #c8a878" }} />
              <div style={{ fontSize: 28, fontStyle: "italic", color: "#c8a878", marginBottom: 16, fontWeight: 300 }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{b.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#8b7762", fontFamily: "sans-serif" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES (Tailor's catalogue) ---- */}
      <section style={{ padding: "80px 48px 100px", background: "#0b2618" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#c8a878", marginBottom: 16, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
              CATALOGUE
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1, color: "#f9f5f0" }}>
              La <em style={{ fontStyle: "italic", fontWeight: 400 }}>collection.</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
            {SERVICES.map(s => (
              <Link href={`/booking?service=${s.id}`} key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px", borderBottom: "1px solid rgba(200,168,120,0.15)", textDecoration: "none", color: "#f9f5f0", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <span style={{ fontSize: 14, fontStyle: "italic", color: "#c8a878" }}>{s.id}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{s.name}</h3>
                    <span style={{ fontSize: 11, color: "rgba(249,245,240,0.4)", fontFamily: "sans-serif" }}>{s.displayDuration}</span>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#c8a878" }}>{s.price} CHF</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 100px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 40, height: 1, background: "#c8a878", margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, lineHeight: 1.1 }}>
            Questions <em style={{ fontStyle: "italic", fontWeight: 400 }}>fréquentes.</em>
          </h2>
        </div>
        {FAQ.map((f, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(200,168,120,0.2)", padding: "28px 0" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{f.q}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#8b7762", fontFamily: "sans-serif" }}>{f.a}</p>
          </div>
        ))}
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "48px 48px", background: "#0b2618", textAlign: "center" }}>
        <div style={{ width: 40, height: 1, background: "#c8a878", margin: "0 auto 20px" }} />
        <div style={{ color: "rgba(200,168,120,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", fontFamily: "sans-serif" }}>
          © 2024 SERENITY RELAX THERAPY · HÉRITAGE · GENÈVE
        </div>
      </footer>
    </div>
  );
}
