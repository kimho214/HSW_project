"use client";

// 🔴 TODO: '김호'님의 백엔드 API (GET /api/profiles?role=STUDENT)가 완성되면,
// 이 임시 데이터를 실제 API 호출로 대체해야 합니다.
import { useState } from "react";
import TalentCard from "../../components/talentCard"; // 🔴 방금 만든 인재 카드

// 🔴 임시 인재 프로필 데이터
const mockTalents = [
  {
    id: 1,
    username: "김학생 (Kim)",
    introduction:
      "UI/UX 디자인과 프론트엔드 개발에 관심이 많습니다. Figma, React, Next.js 사용에 능숙합니다.",
    skills: ["#Figma", "#React", "#Next.js", "#TypeScript"],
  },
  {
    id: 2,
    username: "이디자인 (Lee)",
    introduction:
      "사용자 경험을 중심으로 하는 직관적이고 아름다운 디자인을 추구합니다. 브랜딩과 로고 디자인 경험이 많습니다.",
    skills: ["#로고디자인", "#브랜딩", "#일러스트레이터", "#포토샵"],
  },
  {
    id: 3,
    username: "박개발 (Park)",
    introduction:
      "Python과 Django를 이용한 백엔드 서버 개발이 주특기입니다. 안정적이고 확장 가능한 API를 설계합니다.",
    skills: ["#Python", "#Django", "#API", "#MySQL"],
  },
  {
    id: 4,
    username: "최마케터 (Choi)",
    introduction:
      "데이터 기반의 SNS 마케팅 전략 수립과 콘텐츠 제작을 담당합니다. 유튜브 쇼츠, 인스타그램 릴스 편집 가능.",
    skills: ["#SNS마케팅", "#영상편집", "#콘텐츠기획"],
  },
];

export default function TalentsPage() {
  const [talents, setTalents] = useState(mockTalents);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🔴 TODO: 이 검색 로직도 백엔드 API (GET /api/profiles?skill=...)로 대체
  const filteredTalents = talents.filter(
    (talent) =>
      talent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.introduction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.replace("#", "").toLowerCase())
      )
  );

  return (
    <>
      {/* 1. 히어로 섹션 (인재 검색) */}
      <section className="text-center bg-white p-8 sm:p-12 rounded-lg shadow-md mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          어떤 <span className="text-blue-600">인재</span>를 찾고 계신가요?
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          필요한 스킬이나 키워드로 검색하여, 우리 동네 학생 인재들을 만나보세요.
        </p>

        {/* 검색창 */}
        <div className="mt-8 max-w-xl mx-auto flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="#Figma, #Python, #영상편집..."
            className="flex-1 w-full px-5 py-3 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            검색
          </button>
        </div>
      </section>

      {/* 2. 인재 프로필 목록 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          '{searchTerm || "전체"}' 검색 결과
          <span className="text-blue-600 ml-2">{filteredTalents.length}</span>명
        </h2>

        {/* 인재 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <TalentCard key={talent.id} profile={talent} />
          ))}
        </div>

        {/* 검색 결과가 없을 때 */}
        {filteredTalents.length === 0 && (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">
              '{searchTerm}'에 대한 검색 결과가 없습니다.
            </h3>
            <p className="mt-2 text-gray-600">
              다른 키워드로 검색해 보시거나, 전체 목록을 확인해 보세요.
            </p>
          </div>
        )}
      </section>
    </>
  );
}