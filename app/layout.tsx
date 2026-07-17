import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오래된 물건 사건파일",
  description: "실제 박물관 자료의 단서를 살피며 가설을 기록합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
