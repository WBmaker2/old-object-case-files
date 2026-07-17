import type { Metadata } from "next";
import { CaseFileApp } from "./components/CaseFileApp";

export const metadata: Metadata = {
  title: "오래된 물건 사건파일",
  description: "실제 박물관 자료의 단서를 살피며 역사 가설을 기록하는 초등 5~6학년 학습 앱",
};

export default function Home() {
  return <CaseFileApp />;
}
