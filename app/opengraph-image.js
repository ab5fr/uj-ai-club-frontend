import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoUrl = new URL("/mainlogo.png", SITE_URL).toString();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #00072c 0%, #030870 42%, #001a4d 100%)",
          color: "#f5f8ff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "rgba(4, 112, 252, 0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(231, 73, 4, 0.14)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <img
            src={logoUrl}
            width={88}
            height={88}
            alt=""
            style={{ borderRadius: "18px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#12bbfe",
              }}
            >
              University of Jordan
            </div>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05 }}>
              {SITE_NAME}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#ffffff",
              maxWidth: "900px",
              lineHeight: 1.15,
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: "rgba(245, 248, 255, 0.82)",
              maxWidth: "920px",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 22,
            color: "#12bbfe",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#e74904",
            }}
          />
          uj-aiclub.com
        </div>
      </div>
    ),
    { ...size },
  );
}
