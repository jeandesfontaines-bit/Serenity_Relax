"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

const BENEFITS = [
  { id: "T-01", title: "ANTI-DOULEUR", metric: "Pression 3/5", desc: "Réduction clinique des tensions musculo-squelettiques." },
  { id: "T-02", title: "MOBILITÉ", metric: "Amplitude +40%", desc: "Restauration de l'arc de mouvement fonctionnel." },
  { id: "T-03", title: "STRESS", metric: "Cortisol -28%", desc: "Abaissement mesurable de la réponse de stress." },
];

export default function AlpineClinic() {
  return (
    <div style={{ fontFamily: "'Helvetica Neue', 'Arial', sans-serif", background: "#f7f8fa", color: "#1a1a1a" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 80px)" }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1360, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6B8FA3" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B8FA3" }}>
                THERAPEUTIC PROTOCOL · GENÈVE
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 0.92, marginBottom: 40, color: "#0d1b2a" }}>
              Precision<br />
              <span style={{ fontWeight: 700 }}>Healing.</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#5a6672", maxWidth: 420, marginBottom: 48 }}>
              Massothérapie calibrée avec rigueur scientifique. Chaque protocole est ajusté à votre physiologie, chaque geste est mesuré.
            </p>
            <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 52, padding: "0 32px", background: "#0d1b2a", color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s" }}>
              ACCÉDER AU PROTOCOLE
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <img src="/images/joao-collage.png" alt="Thérapie" style={{ width: "100%", height: 600, objectFit: "cover", filter: "saturate(0.3) contrast(1.1)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 24px", background: "rgba(255,255,255,0.95)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[{ v: "8", l: "PROTOCOLES" }, { v: "97%", l: "EFFICACITÉ" }, { v: "GVA", l: "LOCALISATION" }].map(m => (
                <div key={m.l}>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{m.v}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#8a9199", marginTop: 4 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "100px 48px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#6B8FA3" }}>RÉSULTATS CLINIQUES</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300, letterSpacing: "-0.03em", marginTop: 12 }}>
              Bénéfices <span style={{ fontWeight: 700 }}>mesurables.</span>
            </h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#e2e5e9" }}>
          {BENEFITS.map(b => (
            <div key={b.id} style={{ background: "#f7f8fa", padding: "48px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#8a9199" }}>{b.id}</span>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#6B8FA3", background: "#e8f0f4", padding: "4px 10px" }}>{b.metric}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>{b.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#6b7280" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES ---- */}
      <section style={{ padding: "80px 48px 100px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, borderBottom: "1px solid #e2e5e9", paddingBottom: 24 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#6B8FA3" }}>CATALOGUE DES PROTOCOLES</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.03em", marginTop: 12 }}>
              8 <span style={{ fontWeight: 700 }}>protocoles</span> calibrés.
            </h2>
          </div>
        </div>
        {/* Table-style service list */}
        <div>
          {SERVICES.map((s, i) => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ display: "grid", gridTemplateColumns: "60px 1.5fr 1fr 100px 100px 40px", gap: 16, alignItems: "center", padding: "20px 0", borderBottom: "1px solid #eef0f2", textDecoration: "none", color: "inherit", transition: "background 0.15s" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#c0c5cc" }}>{s.id}</span>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{s.name}</span>
              <span style={{ fontSize: 13, color: "#8a9199", lineHeight: 1.5 }}>{s.desc.slice(0, 60)}…</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6B8FA3" }}>{s.displayDuration}</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{s.price} CHF</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c5cc" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 100px", background: "#0d1b2a", color: "#fff", marginTop: 0 }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#6B8FA3" }}>QUESTIONS FRÉQUENTES</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.03em", marginTop: 12, marginBottom: 48 }}>
            Informations <span style={{ fontWeight: 700 }}>patient.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,0.08)" }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ background: "#0d1b2a", padding: "32px 28px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#6B8FA3", marginBottom: 12 }}>FAQ-{String(i + 1).padStart(2, "0")}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "#e8eaed" }}>{f.q}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "40px 48px", background: "#080f18", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textAlign: "center" }}>
        © 2024 SERENITY RELAX THERAPY · CLINICAL PROTOCOL · GENÈVE
      </footer>
    </div>
  );
}
