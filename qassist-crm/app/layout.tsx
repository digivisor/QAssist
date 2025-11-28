import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "QAssist CRM - Otel Yönetim Sistemi",
  description: "Modern otel yönetim ve rezervasyon sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}
