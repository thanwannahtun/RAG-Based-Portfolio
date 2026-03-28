import type { Metadata, Viewport } from "next";
import "./globals.css";

const ownerName = process.env.NEXT_PUBLIC_OWNER_NAME || "Thanwanna Htun";

export const metadata: Metadata = {
  title: `${ownerName} — Fullstack Developer`,
  description: `Portfolio of ${ownerName}, a professional fullstack developer. Ask AI anything about my skills, projects, and experience.`,
  keywords: ["fullstack developer", "typescript", "nextjs", "react", "portfolio", "AI"],
  authors: [{ name: ownerName }],
  openGraph: {
    title: `${ownerName} — Fullstack Developer`,
    description: "AI-powered portfolio. Ask anything.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f9fc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}