import { Html, Head, Main, NextScript } from "next/document";
import { bodyFont, displayFont } from "@/lib/fonts";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
