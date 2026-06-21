import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ChomperZ Idle",
    short_name: "ChomperZ",
    description: "ChomperZ Web2.5 idle game — farm Z-Coins, sync NFTs, explore the map.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#141514",
    theme_color: "#141514",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/images/chomper.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/images/chomper.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
