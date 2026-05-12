import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, #b0c6ff 0%, #568dff 100%)",
          borderRadius: 40,
          boxShadow: "inset 0 4px 0 rgba(255,255,255,0.3)",
        }}
      >
        <svg
          width="108"
          height="108"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 4 H5 V20 H19"
            stroke="#002d6f"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="13" y="10" width="4" height="4" rx="1" fill="#002d6f" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
