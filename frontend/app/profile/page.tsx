"use client"; // 🔴 폼 입력을 위해 useState, useReducer 등을 사용하므로 클라이언트 컴포넌트입니다.

import { useState } from "react";
// 🔴 TODO: '김호'님의 백엔드 API가 완성되면,
// 이 페이지에서 프로필 수정(PUT /api/profiles/my-profile)과
// 포트폴리오 추가(POST /api/portfolios) API를 호출해야 합니다.

// 🔴 임시 포트폴리오 데이터 타입 (나중에 실제 타입으로 교체)
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export default function ProfilePage() {
  // 1. 프로필 섹션 상태
  const [introduction, setIntroduction] = useState(
    "안녕하세요! UI/UX 디자인과 프론트엔드 개발에 관심이 많은 학생입니다."
  );

  // 2. 보유 스킬 섹션 상태
  const [skills, setSkills] = useState(["#Figma", "#React", "#Next.js"]);
  const [currentSkill, setCurrentSkill] = useState("");

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      // 🔴 스킬 태그 형식으로 추가 (예: "Figma" -> "#Figma")
      setSkills([...skills, `${currentSkill.startsWith("#") ? "" : "#"}${currentSkill}`]);
      setCurrentSkill(""); // 입력창 비우기
    }
  };

  // 3. 포트폴리오 섹션 상태
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    // 🔴 임시 데이터 (백엔드에서 불러올 데이터)
    {
      id: 1,
      title: "팀 프로젝트 '이음' 플랫폼",
      description: "Next.js와 TypeScript를 사용한 캡스톤 디자인 프로젝트...",
      imageUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Project+Image+1",
      linkUrl: "https://github.com",
    },
    {
      id: 2,
      title: "개인 포트폴리오 사이트",
      description: "React와 Three.js를 활용한 인터랙티브 웹사이트 제작...",
      imageUrl: "https://placehold.co/600x400/10B981/FFFFFF?text=Project+Image+2",
      linkUrl: "https://github.com",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔴 TODO: 여기서 '김호'님의 백엔드 API 호출
    // 1. PUT /api/profiles/my-profile (introduction, skills 전송)
    // 2. POST /api/portfolios (새로 추가된 포트폴리오 항목 전송)
    console.log("프로필 저장:", { introduction, skills, portfolioItems });
    alert("프로필이 저장되었습니다! (임시)");
  };

  return (
    // 🔴 layout.tsx가 감싸고 있으므로 <main> 태그는 제거했습니다.
    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-md w-full">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-8">
        <span className="text-blue-600">인재 프로필</span> 관리
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. 기본 정보 (자기소개) */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            간단 소개
          </h2>
          <textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="소상공인에게 나를 어필할 수 있는 한 줄 소개, 경험 등을 자유롭게 작성해 주세요."
          />
        </section>

        {/* 2. 보유 스킬 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            보유 스킬
          </h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="flex-1 w-full px-4 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: Figma, Python, 영상편집 (입력 후 Enter)"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                  className="ml-1.5 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* 3. 포트폴리오 */}
        <section>
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">
              포트폴리오
            </h2>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              + 새 포트폴리오 추가
            </button>
          </div>
          
          {/* 🔴 TODO: 새 포트폴리오 추가 폼 (모달 또는 아코디언) */}
          {/* ... (여기서 폼을 만들어 portfolioItems 상태에 추가하는 로직 필요) ... */}

          {/* 포트폴리오 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 h-10 overflow-hidden">
                    {item.description}
                  </p>
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    자세히 보기 &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 저장 버튼 */}
        <div className="text-right">
          <button
            type="submit"
            className="group relative inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-3 px-8 text-lg font-medium text-white hover:bg-blue-700"
          >
            프로필 저장하기
          </button>
        </div>
      </form>
    </div>
  );
}