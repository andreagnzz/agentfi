import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import CardNav from "@/components/CardNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentFi",
  description: "The banking system for autonomous AI agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CardNav />
          <div style={{ paddingTop: 60 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
