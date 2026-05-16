"use client";
import Link from "next/link";
import { SERVICES, FAQ } from "../../data";

export default function EditorialMonolith() {
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f5f2ec", color: "#1a1a1a" }}>
      {/* ---- HERO ---- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative" }}>
        {/* Grain texture overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }} />
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 48px", width: "100%", display: "grid", gridTemplateColumns: "7fr 4fr", gap: 40, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "clamp(4rem, 10vw, 9rem)", fontWeight: 400, lineHeight: 0.88, letterSpacing: "-0.03em", color: "#1a1a1a", marginBottom: 40 }}>
              Le<br />soin<br />
              <em style={{ fontStyle: "italic", fontWeight: 300, color: "#6b6b6b" }}>juste.</em>
            </h1>
            <div style={{ maxWidth: 380, borderTop: "1px solid #ccc", paddingTop: 24, marginTop: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: "#5a5a5a" }}>
                Massothérapie thérapeutique à Genève. Des gestes précis, un silence intentionnel, un corps qui se remet en place.
              </p>
            </div>
          </div>
          <div>
            <img src="/images/joao-collage.png" alt="" style={{ width: 200, height: 280, objectFit: "cover", filter: "grayscale(1) contrast(1.1)", marginLeft: "auto" }} />
            <div style={{ marginTop: 16, textAlign: "right", fontSize: 10, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              Cabinet · Cointrin, GVA
            </div>
          </div>
        </div>
      </section>

      {/* ---- BENEFITS ---- */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "100px 48px", borderTop: "1px solid #d5d0c8" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 8fr", gap: 80 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              BIENFAITS
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px" }}>
            {[
              { n: "I.", t: "Soulager les tensions", d: "Le soin dénoue les zones crispées et réduit les douleurs musculaires." },
              { n: "II.", t: "Mobilité retrouvée", d: "Le corps gagne en souplesse, les gestes redeviennent fluides." },
              { n: "III.", t: "Moins de stress", d: "La respiration ralentit, la récupération devient plus profonde." },
            ].map(b => (
              <div key={b.n} style={{ padding: "0 32px 0 0" }}>
                <div style={{ fontSize: 28, fontWeight: 300, fontStyle: "italic", color: "#bbb", marginBottom: 16 }}>{b.n}</div>
                <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 12 }}>{b.t}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#777" }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SERVICES (Menu-style) ---- */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "80px 48px 100px", borderTop: "1px solid #d5d0c8" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 8fr", gap: 80 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              COLLECTION
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, lineHeight: 1.1, marginTop: 16 }}>
              Les <em style={{ fontStyle: "italic" }}>soins.</em>
            </h2>
          </div>
          <div>
            {SERVICES.map((s, i) => (
              <Link href={`/booking?service=${s.id}`} key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 0", borderBottom: "1px solid #e5e0d8", textDecoration: "none", color: "inherit", transition: "padding-left 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                  <span style={{ fontSize: 12, fontStyle: "italic", color: "#bbb" }}>{s.id}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>{s.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 32 }}>
                  <span style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif" }}>{s.displayDuration}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{s.price} CHF</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section style={{ maxWidth: 1360, margin: "0 auto", padding: "80px 48px 100px", borderTop: "1px solid #d5d0c8" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 8fr", gap: 80 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              FAQ
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 400, lineHeight: 1.1, marginTop: 16 }}>
              Avant la <em>séance.</em>
            </h2>
          </div>
          <div>
            {FAQ.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid #e5e0d8", padding: "28px 0" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{f.q}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#777" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ padding: "48px 48px", borderTop: "1px solid #d5d0c8", textAlign: "center", color: "#bbb", fontSize: 11, letterSpacing: "0.15em", fontFamily: "sans-serif" }}>
        © 2024 SERENITY RELAX THERAPY · ÉDITION · GENÈVE
      </footer>
    </div>
  );
}
