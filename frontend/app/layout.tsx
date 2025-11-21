import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // 🔴 Header 컴포넌트 import

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "이음 - 지역과 인재를 잇다",
  description: "지역 소상공인과 대학생 인재를 잇는 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 🔴 폰트와 배경색 적용, flex 레이아웃 설정 */}
      <body
        className={`${inter.variable} font-sans bg-gray-50 flex flex-col min-h-screen`}
      >
        {/* 1. 공통 헤더 */}
        <Header />

        {/* 2. 실제 페이지 내용 ({children} = page.tsx, login/page.tsx 등) */}
        {/* flex-grow가 메인 컨텐츠를 밀어내서 푸터를 하단에 고정시킴 */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>

        {/* 3. 공통 푸터 */}
        <footer className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 이음 (Team HSW) - 캡스톤 디자인 프로젝트</p>
            <p className="mt-1">
              본 사이트는 포트폴리오 목적으로 제작되었으며, 상업적 용도로
              사용되지 않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}