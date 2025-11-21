"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔴 TODO: 나중에 백엔드 API에서 프로젝트 목록 가져오기
  const projects = [
    {
      id: 1,
      title: "신메뉴 홍보용 포스터 디자인",
      company: "박사장 떡볶이",
      category: "디자인",
      price: "50,000원",
      description:
        "이번에 새로 나온 '로제 떡볶이' 홍보용 인스타그램 카드뉴스 및 포스터 디자인이 필요합니다. 레트로 감성으로...",
      skills: ["#포토샵", "#일러스트레이터", "#SNS디자인"],
      categoryColor: "blue",
    },
    {
      id: 2,
      title: "카페 메뉴 소개 랜딩페이지 제작",
      company: "김사장 스페셜티",
      category: "개발",
      price: "재능기부",
      description:
        "저희 스페셜티 원두를 소개하는 간단한 1페이지 짜리 웹사이트(랜딩페이지)가 필요합니다. 템플릿 수정 가능...",
      skills: ["#HTML/CSS", "#JavaScript", "#웹퍼블리싱"],
      categoryColor: "green",
    },
    {
      id: 3,
      title: "유튜브 쇼츠 편집 (주 2회)",
      company: "오사장 공방",
      category: "영상/마케팅",
      price: "건당 30,000원",
      description:
        "공방에서 도자기 만드는 과정을 찍은 원본 영상을 1분 내외의 쇼츠/릴스 영상으로 편집해주실 분을 찾습니다. 자막 작업...",
      skills: ["#영상편집", "#프리미어프로", "#쇼츠"],
      categoryColor: "purple",
    },
  ];

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getCategoryColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
    };
    return colors[color] || "bg-gray-100 text-gray-800";
  };

  const getPriceColorClass = (price: string) => {
    if (price.includes("재능기부")) return "text-green-600";
    return "text-blue-600";
  };

  return (
    <>
      {/* 검색 섹션 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          프로젝트 찾기
        </h1>
        <p className="text-gray-600 mb-6">
          학생 여러분의 재능을 펼칠 수 있는 프로젝트를 찾아보세요!
        </p>

        {/* 검색창 */}
        <div className="max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="프로젝트 제목이나 스킬로 검색... (예: 디자인, 영상편집)"
            className="w-full px-5 py-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </section>

      {/* 프로젝트 목록 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            전체 {filteredProjects.length}개의 프로젝트
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
            <option>최신순</option>
            <option>마감임박순</option>
            <option>금액높은순</option>
          </select>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryColorClass(
                        project.categoryColor
                      )}`}
                    >
                      {project.category}
                    </span>
                    <span
                      className={`text-lg font-bold ${getPriceColorClass(
                        project.price
                      )}`}
                    >
                      {project.price}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {project.company}
                  </p>
                  <p className="mt-3 text-sm text-gray-700 h-16 overflow-hidden">
                    {project.description}
                  </p>

                  {/* 스킬 태그 */}
                  <div className="mt-4">
                    {project.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full text-center inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    상세보기 및 지원하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}