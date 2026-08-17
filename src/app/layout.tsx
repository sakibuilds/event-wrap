import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Wrap — Post-event communication pack",
  description:
    "Turn one event brief into copy-ready thank-you emails, attendee recaps, partner notes, team recaps, and social posts.",
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