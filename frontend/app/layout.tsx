import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Courtroom Mode — Multi-Agent Life-Decision Engine",
  description: "A gamified multi-agent courtroom where Advocate, Skeptic, and Judge argue using your actual history, values, and vector memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-1 relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
