import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ShotChall";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(180deg, #fdf4ee 0%, #edf3ff 100%)",
                }}
            >
                {/* Decorative background element mimicking the radial gradient */}
                <div
                    style={{
                        position: "absolute",
                        top: "-200px",
                        left: "-200px",
                        width: "800px",
                        height: "800px",
                        background: "radial-gradient(circle, #ffe6d6 0%, transparent 70%)",
                        opacity: 0.6,
                        filter: "blur(40px)",
                    }}
                />

                {/* Text content */}
                <div
                    style={{
                        display: "flex",
                        fontSize: 130,
                        color: "#10131c",
                        fontWeight: 800,
                        fontFamily: "serif",
                        zIndex: 10,
                        marginBottom: 20,
                    }}
                >
                    ShotChall
                </div>

                <div
                    style={{
                        display: "flex",
                        fontSize: 40,
                        color: "#ff6b35",
                        fontFamily: "sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        zIndex: 10,
                        textTransform: "uppercase",
                    }}
                >
                    Snap. Compete. Win.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
