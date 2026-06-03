import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GC Pricing",
    short_name: "GC Pricing",
    description: "Maxis & Hotlink device + WiFi pricing — fast counter quotes.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d0f",
    theme_color: "#0a0d0f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
