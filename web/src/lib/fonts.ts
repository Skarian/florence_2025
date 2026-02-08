import { Space_Grotesk, Source_Serif_4 } from "next/font/google";

export const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
