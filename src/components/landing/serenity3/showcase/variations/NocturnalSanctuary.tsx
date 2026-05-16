"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function NocturnalSanctuary() {
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", background: "#0a0a0e", color: "#e8e4dc", minHeight: "100vh" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(30,25,40,1) 0%, #0a0a0e 70%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          <img src="/images/joao-collage.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.5)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800, padding: "0 32px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(200,168,120,0.5)", marginBottom: 40, textTransform: "uppercase", fontWeight: 600 }}>
            LE SANCTUAIRE NOCTURNE
          </div>
          <h1 style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 32, fontFamily: "'Playfair Display', 'Georgia', serif" }}>
            <span style={{ color: "rgba(232,228,220,0.12)" }}>Dans le</span>
            <br />
            <span style={{ color: "#e8e4dc" }}>silence.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(232,228,220,0.3)", maxWidth: 440, margin: "0 auto 56px" }}>
            Un refuge pour les sens. Ici, le monde extérieur cesse d'exister.
            Le soin commence par le silence.
          </p>
          <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 44px", border: "1px solid rgba(200,168,120,0.25)", background: "transparent", color: "#c8a878", fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.5s", backdropFilter: "blur(8px)" }}>
            ENTRER
          </Link>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ padding: "120px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
          {[
            { t: "Soulager les tensions", d: "Les zones crispées se relâchent dans l'obscurité apaisante.", icon: "◐" },
            { t: "Mobilité retrouvée", d: "Le corps s'ouvre en silence, loin de la stimulation.", icon: "◑" },
            { t: "Moins de stress", d: "Le système nerveux s'éteint doucement, comme une lumière.", icon: "◒" },
          ].map((b, i) => (
            <div key={i} style={{ padding: "40px 32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 2 }}>
              <div style={{ fontSize: 24, marginBottom: 20, color: "rgba(200,168,120,0.4)" }}>{b.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#e8e4dc", fontFamily: "'Playfair Display', serif" }}>{b.t}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(232,228,220,0.3)" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SERVICES ---- */}
      <section style={{ padding: "0 48px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.25em", color: "rgba(200,168,120,0.4)", textTransform: "uppercase" }}>LES SOINS</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {SERVICES.map(s => (
            <Link href={`/booking?service=${s.id}`} key={s.id} style={{ display: "block", padding: "28px 20px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)", textDecoration: "none", color: "inherit", transition: "all 0.5s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(200,168,120,0.35)" }}>N°{s.id}</span>
                <span style={{ fontSize: 11, color: "rgba(232,228,220,0.2)" }}>{s.displayDuration}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, fontFamily: "'Playfair Display', serif", color: "rgba(232,228,220,0.7)" }}>{s.name}</h3>
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(232,228,220,0.2)" }}>{s.desc.slice(0, 60)}…</p>
              <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "rgba(200,168,120,0.5)" }}>{s.price} CHF</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ padding: "80px 48px 100px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, marginBottom: 48, textAlign: "center", fontFamily: "'Playfair Display', serif", color: "rgba(232,228,220,0.5)" }}>
            Questions fréquentes
          </h2>
          {FAQ.map((f, i) => (
            <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "28px 0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "rgba(232,228,220,0.6)" }}>{f.q}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(232,228,220,0.25)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "48px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <div style={{ color: "rgba(200,168,120,0.2)", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em" }}>
          © 2024 SERENITY RELAX THERAPY · NOCTURNE · GENÈVE
        </div>
      </footer>
    </div>
  );
}
