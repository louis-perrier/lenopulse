import { ImageResponse } from "next/og";

// Image de partage social (Open Graph et Twitter), generee au build et servie en
// statique (compatible output: export). Reprend l'identite noir et or de la marque.
// Texte volontairement sans accent pour rester sur la police par defaut de next/og.

export const alt = "LENOPULSE. Sites, applications et IA qui travaillent pour vous";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(900px 520px at 82% -12%, rgba(212,168,71,0.24), rgba(212,168,71,0))",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#d4a847",
          }}
        >
          Sites · Applications · Automatisations · IA
        </div>

        <div style={{ display: "flex", marginTop: 24, fontSize: 120, fontWeight: 700 }}>
          <span style={{ color: "#f5f0e8" }}>LENO</span>
          <span style={{ color: "#d4a847" }}>PULSE</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 880,
            fontSize: 38,
            lineHeight: 1.3,
            color: "#9a9080",
          }}
        >
          Des sites, des applications et des agents IA qui travaillent pour vous, jour
          et nuit.
        </div>
      </div>
    ),
    { ...size }
  );
}
