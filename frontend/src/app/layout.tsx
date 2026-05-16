import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import ConditionalSidebar from "@/components/ConditionalSidebar";

export const metadata: Metadata = {
  title: "DClaw Inventory",
  description: "DClaw Inventory Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--dk-bg-muted)", color: "var(--dk-fg-1)", fontFamily: "var(--dk-font-sans)" }}>
        <AuthGuard>
          <div className="flex min-h-screen">
            <ConditionalSidebar />
            <main className="flex-1 p-8 overflow-auto">{children}</main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
