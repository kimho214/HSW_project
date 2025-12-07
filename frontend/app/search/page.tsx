"use client";

import { useSearchParams } from "next/navigation"; // 🔴 쿼리 파라미터(?q=...)를 읽기 위한 훅
import { useState, useEffect, Suspense } from "react"; // 🔴 Suspense 추가
import TalentCard from "../../components/talentCard";

// 🔴 임시 인재 데이터 (나중에 백엔드 API 연동 시 삭제)
const mockTalents = [
  {
    id: 1,
    username: "김디자인",
    introduction:
      "사용자 중심의 직관적이고 아름다운 UI/UX를 설계합니다. Figma와 React에 능숙합니다.",
    skills: ["#Figma", "#UI/UX", "#React", "#웹디자인"],
  },
  {
    id: 2,
    username: "이개발",
    introduction:
      "Next.js와 TypeScript를 사용한 서버사이드 렌더링에 자신 있습니다. 깨끗한 코드를 지향합니다.",
    skills: ["#Next.js", "#TypeScript", "#Node.js"],
  },
  {
    id: 3,
    username: "박마케터",
    introduction:
      "데이터 기반의 SNS 마케팅 전략을 수립합니다. 인스타그램 릴스, 유튜브 쇼츠 콘텐츠 기획 전문가입니다.",
    skills: ["#SNS마케팅", "#영상기획", "#콘텐츠제작"],
  },
  {
    id: 4,
    username: "최영상",
    introduction:
      "프리미어 프로와 애프터 이펙트를 활용한 감각적인 영상 편집. 유튜브 썸네일 제작 가능.",
    skills: ["#영상편집", "#프리미어프로", "#유튜브"],
  },
];

// 🔴 검색 결과를 표시하는 컴포넌트 (useSearchParams 사용)
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // 🔴 URL에서 'q' 파라미터 값을 가져옴 (없으면 빈 문자열)
  const [results, setResults] = useState(mockTalents);

  useEffect(() => {
    if (query) {
      // 🔴 검색어(query)가 포함된 인재 필터링 (대소문자 무시, # 제거)
      const filtered = mockTalents.filter(
        (talent) =>
          talent.username.toLowerCase().includes(query.toLowerCase()) ||
          talent.introduction.toLowerCase().includes(query.toLowerCase()) ||
          talent.skills.some((skill) =>
            skill
              .toLowerCase()
              .replace("#", "")
              .includes(query.toLowerCase().replace("#", ""))
          )
      );
      setResults(filtered);
    } else {
      setResults([]); // 검색어가 없으면 빈 결과
    }
  }, [query]);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        '<span className="text-blue-600">{query}</span>' 검색 결과
      </h1>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((talent) => (
            <TalentCard key={talent.id} profile={talent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-600">
            검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
          </p>
        </div>
      )}
    </>
  );
}

// 🔴 메인 페이지 컴포넌트 (Suspense로 감싸야 함)
export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div>검색 결과를 불러오는 중...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}