"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function ZenBrutalist() {
  return (
    <div style={{ fontFamily: "'Space Mono', 'Courier New', monospace", background: "#e8e4dc", color: "#1a1a1a" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", borderBottom: "2px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 48px", width: "100%" }}>
          <h1 style={{ fontSize: "clamp(4rem, 12vw, 10rem)", fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.05em", textTransform: "uppercase", marginBottom: 40, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
            SERE<br />NITY<span style={{ color: "#556B2F" }}>.</span>
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, maxWidth: 800 }}>
            <div>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: "#555" }}>
                Massothérapie thérapeutique. Genève, Suisse. Pas de décor superflu. Le geste, le silence, le résultat.
              </p>
            </div>
            <div>
              <Link href="/booking" style={{ display: "inline-block", padding: "16px 32px", border: "2px solid #1a1a1a", background: "transparent", color: "#1a1a1a", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.1s" }}>
                RÉSERVER →
              </Link>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 48, bottom: 48, width: 240, height: 320, overflow: "hidden", border: "2px solid #1a1a1a" }}>
          <img src="/images/joao-collage.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.3)" }} />
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ borderBottom: "2px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { t: "TENSIONS", d: "Dissolution des nœuds. Réduction de la douleur chronique." },
            { t: "MOBILITÉ", d: "Amplitude restaurée. Gestes redevenus libres." },
            { t: "STRESS", d: "Cortisol en baisse. Silence intérieur retrouvé." },
          ].map((b, i) => (
            <div key={i} style={{ padding: "48px 36px", borderRight: i < 2 ? "2px solid #1a1a1a" : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#556B2F", marginBottom: 16 }}>0{i + 1}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>{b.t}</h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: "#777" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES (Brutalist blocks) ---- */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "64px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#556B2F" }}>SOINS</span>
          <div style={{ flex: 1, height: 2, background: "#1a1a1a" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {SERVICES.map(s => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ display: "block", border: "2px solid #1a1a1a", padding: 0, textDecoration: "none", color: "#1a1a1a", background: "#e8e4dc", transition: "all 0.1s", position: "relative", overflow: "hidden" }}>
              <div style={{ padding: "20px 16px", borderBottom: "1px solid #ccc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#999" }}>N°{s.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#556B2F" }}>{s.price}.-</span>
                </div>
              </div>
              <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
                <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.8) contrast(1.2)", opacity: 0.7 }} />
              </div>
              <div style={{ padding: "16px", borderTop: "1px solid #ccc" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Inter', sans-serif" }}>{s.name}</h3>
                <div style={{ fontSize: 10, color: "#999", marginTop: 4, fontWeight: 700, letterSpacing: "0.1em" }}>{s.displayDuration}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ borderTop: "2px solid #1a1a1a", padding: "64px 48px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#556B2F" }}>FAQ</span>
          <div style={{ flex: 1, height: 2, background: "#1a1a1a" }} />
        </div>
        {FAQ.map((f, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 24, borderBottom: "1px solid #ccc", padding: "20px 0" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#556B2F" }}>Q.{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>{f.q}</h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: "#777" }}>{f.a}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "32px 48px", borderTop: "2px solid #1a1a1a", background: "#1a1a1a", color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textAlign: "center" }}>
        © 2024 SERENITY RELAX THERAPY · BRUTALIST · GENÈVE
      </footer>
    </div>
  );
}
