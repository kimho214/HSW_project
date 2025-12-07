"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface TalentProfile {
  id: number;
  username: string;
  email: string;
  introduction: string;
  skills: string;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
}

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/profiles/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "프로필을 불러오지 못했습니다.");
      }

      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || "프로필을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error || "프로필을 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.push("/talents")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const skillsArray = profile.skills
    ? profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => (s.startsWith("#") ? s : `#${s}`))
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="mb-4 sm:mb-6 flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-900 transition"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">목록으로 돌아가기</span>
        <span className="sm:hidden">뒤로가기</span>
      </button>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-white text-blue-600">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {profile.username.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{profile.username}</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base break-all">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* 본문 섹션 */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* 자기소개 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              자기소개
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
                {profile.introduction || "아직 소개가 없습니다."}
              </p>
            </div>
          </section>

          {/* 보유 스킬 */}
          {skillsArray.length > 0 && (
            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                보유 스킬
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium break-words"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 링크 모음 */}
          {(profile.portfolio_url || profile.github_url || profile.linkedin_url) && (
            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                포트폴리오 및 링크
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600">
                        포트폴리오
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {profile.portfolio_url}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}

                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-gray-800 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600">
                        GitHub
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {profile.github_url}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-700 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600">
                        LinkedIn
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {profile.linkedin_url}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* 연락하기 버튼 */}
          <section className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              {/* 채팅하기 버튼 */}
              <button
                onClick={() => {
                  // 쿠키에서 토큰 확인
                  const token = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1];

                  if (!token) {
                    alert("채팅을 하려면 로그인이 필요합니다.");
                    router.push("/login");
                    return;
                  }

                  // 로그인한 사용자 이메일 가져오기
                  try {
                    const base64Url = token.split(".")[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                      atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    );
                    const payload = JSON.parse(jsonPayload);
                    const myEmail = payload.email;

                    // room_id 생성: 두 이메일을 정렬해서 조합
                    const roomId = [myEmail, profile.email].sort().join("_");

                    // 채팅 페이지로 이동
                    router.push(`/chat/${roomId}?name=${encodeURIComponent(profile.username)}`);
                  } catch (error) {
                    alert("사용자 정보를 확인하는 데 실패했습니다. 다시 로그인해주세요.");
                    router.push("/login");
                  }
                }}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-green-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                채팅하기
              </button>

              {/* 이메일로 연락하기 버튼 */}
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`[이음] ${profile.username}님께 연락드립니다`);
                  const body = encodeURIComponent(`안녕하세요 ${profile.username}님,\n\n이음 플랫폼에서 프로필을 보고 연락드립니다.\n\n`);
                  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
                }}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">이메일로 연락하기</span>
                <span className="sm:hidden">이메일 보내기</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
