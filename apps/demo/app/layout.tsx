import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fractal SVG Playground",
  description: "Interactive playground for generating fractal SVGs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
