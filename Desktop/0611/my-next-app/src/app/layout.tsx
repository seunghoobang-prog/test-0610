import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "하노이 임장단 | 해외여행 & 부동산 투자 커뮤니티",
  description: "하노이를 투자의 눈으로 여행한다. 서울 직장인 2030을 위한 베트남 하노이 여행 & 부동산 임장 커뮤니티.",
  keywords: ["하노이", "베트남 부동산", "임장", "해외투자", "하노이 여행"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-yellow-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
