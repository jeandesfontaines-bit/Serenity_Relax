"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function KineticFlow() {
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", background: "#04080f", color: "#fff", overflow: "hidden" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, #1a2980 0%, #04080f 70%)" }} />
        <div style={{ position: "absolute", top: "20%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,70,200,0.3) 0%, transparent 70%)", filter: "blur(80px)", animation: "pulse 6s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,180,255,0.15) 0%, transparent 70%)", filter: "blur(60px)", animation: "pulse 8s ease-in-out infinite alternate-reverse" }} />
        <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.2); opacity: 1; } }`}</style>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1360, margin: "0 auto", padding: "0 48px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 32, height: 2, background: "#4d7fff" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#4d7fff", textTransform: "uppercase" }}>EN MOUVEMENT</span>
          </div>
          <h1 style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)", fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em", marginBottom: 32 }}>
            <span style={{ display: "block", background: "linear-gradient(135deg, #fff 0%, #4d7fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LIBÉRER</span>
            <span style={{ display: "block", fontWeight: 200, color: "rgba(255,255,255,0.4)", fontSize: "0.65em" }}>LE FLUX DU CORPS.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", maxWidth: 440, marginBottom: 48 }}>
            Des techniques fluides et dynamiques qui remettent le corps en mouvement. La thérapie comme un déblocage, pas un simple relâchement.
          </p>
          <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "18px 40px", borderRadius: 999, background: "linear-gradient(135deg, #2246C8, #4d7fff)", color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", boxShadow: "0 10px 40px rgba(34,70,200,0.4)", transition: "all 0.3s" }}>
            RÉSERVER →
          </Link>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "120px 48px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            { icon: "⚡", t: "DÉBLOCAGE", d: "Dissolution des points de tension, restauration du flux musculaire." },
            { icon: "↻", t: "MOBILITÉ", d: "Amplitude retrouvée, mouvements fluides et naturels." },
            { icon: "◎", t: "ÉQUILIBRE", d: "Le système nerveux se recalibre, le stress diminue." },
          ].map((b, i) => (
            <div key={i} style={{ padding: "48px 32px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, #4d7fff ${(i + 1) * 33}%, transparent)` }} />
              <div style={{ fontSize: 32, marginBottom: 20 }}>{b.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12, color: "#4d7fff" }}>{b.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES (Infinite scroll feel) ---- */}
      <section style={{ padding: "0 48px 120px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{ width: 32, height: 2, background: "#4d7fff" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#4d7fff", textTransform: "uppercase" }}>8 PROTOCOLES</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {SERVICES.map((s) => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ position: "relative", display: "block", aspectRatio: "3/4", overflow: "hidden", textDecoration: "none", color: "#fff" }}>
              <img src={s.image} alt={s.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(0.5)", transition: "all 0.6s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,8,15,0.9) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#4d7fff", marginBottom: 8 }}>{s.displayDuration}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>{s.name}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s.desc.slice(0, 50)}…</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 100px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 48, textAlign: "center" }}>
            <span style={{ color: "#4d7fff" }}>?</span> FAQ
          </h2>
          {FAQ.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "24px 0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.4)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "40px 48px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em" }}>
        © 2024 SERENITY RELAX THERAPY · KINETIC · GENÈVE
      </footer>
    </div>
  );
}
