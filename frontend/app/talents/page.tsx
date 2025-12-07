"use client";

import { useEffect, useState } from "react";
import TalentCard from "../../components/talentCard";

interface TalentProfile {
  id: number;
  username: string;
  introduction: string;
  skills: string[];
}

export default function TalentsPage() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async (skill?: string) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const url = new URL(`${apiUrl}/profiles`);

      if (skill) {
        url.searchParams.append("skill", skill.replace("#", ""));
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "인재 목록을 불러오지 못했습니다.");
      }

      const normalized = (data.profiles || []).map((profile: any) => {
        const skillsArray = (profile.skills || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((s: string) => (s.startsWith("#") ? s : `#${s}`));

        return {
          id: profile.id,
          username: profile.username || profile.email || "이름 미상",
          introduction: profile.introduction || "아직 소개가 없습니다.",
          skills: skillsArray,
        } as TalentProfile;
      });

      setTalents(normalized);
    } catch (err: any) {
      console.error("인재 목록 불러오기 실패:", err);
      setError(err.message || "인재 목록을 불러오지 못했습니다.");
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTalents(searchTerm.trim());
  };

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
        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex">
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
        </form>
      </section>

      {/* 2. 인재 프로필 목록 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          '{searchTerm || "전체"}' 검색 결과
          <span className="text-blue-600 ml-2">{talents.length}</span>명
        </h2>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <p className="text-gray-600">불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((talent) => (
                <TalentCard key={talent.id} profile={talent} />
              ))}
            </div>

            {talents.length === 0 && !error && (
              <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900">
                  '{searchTerm || "전체"}'에 대한 검색 결과가 없습니다.
                </h3>
                <p className="mt-2 text-gray-600">
                  다른 키워드로 검색해 보시거나, 전체 목록을 확인해 보세요.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
