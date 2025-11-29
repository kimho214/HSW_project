"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  duration: string;
  required_skills: string;
  status: string;
  business_name: string;
  business_address: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 프로젝트 목록 가져오기
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/projects?status=OPEN`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      } else {
        setError(data.message || "프로젝트를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("프로젝트 로딩 실패:", err);
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.required_skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* 1. 히어로 섹션 (프로젝트 검색) */}
      <section className="text-center bg-white p-8 sm:p-12 rounded-lg shadow-md mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          어떤 <span className="text-blue-600">프로젝트</span>를 찾고 계신가요?
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          필요한 스킬이나 키워드로 검색하여, 나에게 맞는 프로젝트를 찾아보세요.
        </p>

        {/* 검색창 */}
        <div className="mt-8 max-w-xl mx-auto flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="프로젝트 제목이나 스킬로 검색... (예: 디자인, 영상편집)"
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

      {/* 2. 프로젝트 목록 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          '{searchTerm || "전체"}' 검색 결과
          <span className="text-blue-600 ml-2">{filteredProjects.length}</span>개
        </h2>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">프로젝트를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900">
              '{searchTerm}'에 대한 검색 결과가 없습니다.
            </h3>
            <p className="mt-2 text-gray-600">
              다른 키워드로 검색해 보시거나, 전체 목록을 확인해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const skills = project.required_skills
                ? project.required_skills.split(",").map((s) => s.trim())
                : [];

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {project.location || "지역 미정"}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {project.salary || "급여 협의"}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {project.business_name}
                    </p>
                    <p className="mt-3 text-sm text-gray-700 h-16 overflow-hidden">
                      {project.description}
                    </p>

                    {/* 기간 정보 */}
                    {project.duration && (
                      <p className="mt-2 text-xs text-gray-500">
                        기간: {project.duration}
                      </p>
                    )}

                    {/* 스킬 태그 */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                        >
                          {skill.startsWith("#") ? skill : `#${skill}`}
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
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}