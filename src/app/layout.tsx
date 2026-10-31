import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow — bot flow editor",
  description: "Node-based WhatsApp bot flow editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "0 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#fff",
          }}
        >
          <Link href="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: "none", color: "#0f172a" }}>
            Flow
          </Link>
          <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <Link href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
              Editor
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
