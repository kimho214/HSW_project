"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AIVersion {
  label: string;
  text: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [introduction, setIntroduction] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isProfilePublic, setIsProfilePublic] = useState(true);

  // AI 자기소개 생성 관련 상태
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiStyle, setAiStyle] = useState("auto"); // auto, simple, detailed, professional
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiVersions, setAiVersions] = useState<AIVersion[]>([]);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // JWT 토큰에서 역할 확인
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "STUDENT") {
        alert("학생만 프로필을 등록할 수 있습니다.");
        router.push("/");
        return;
      }
    } catch (err) {
      console.error("토큰 파싱 실패:", err);
      alert("로그인 정보가 올바르지 않습니다.");
      router.push("/login");
      return;
    }

    fetchMyProfile(token);
  }, []);

  const fetchMyProfile = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/profiles/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.profile) {
        const profile = data.profile;
        setIntroduction(profile.introduction || "");
        setSkills(profile.skills ? profile.skills.split(",").map((s: string) => s.trim()) : []);
        setPortfolioUrl(profile.portfolio_url || "");
        setGithubUrl(profile.github_url || "");
        setLinkedinUrl(profile.linkedin_url || "");
        setIsProfilePublic(profile.is_profile_public !== false);
      }
    } catch (err) {
      console.error("프로필 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      const newSkill = currentSkill.startsWith("#") ? currentSkill : `#${currentSkill}`;
      setSkills([...skills, newSkill]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleGenerateAI = async () => {
    if (!aiInput.trim()) {
      alert("키워드나 짧은 문장을 입력해주세요.");
      return;
    }

    if (aiInput.trim().length < 3) {
      alert("최소 3자 이상 입력해주세요.");
      return;
    }

    setAiGenerating(true);
    setAiVersions([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/ai/generate-intro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: aiInput,
          style: aiStyle,
        }),
      });

      const data = await response.json();

      if (response.ok && data.versions) {
        setAiVersions(data.versions);
      } else {
        alert(data.message || "AI 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("AI 생성 실패:", err);
      alert("AI 생성 중 오류가 발생했습니다.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSelectAIVersion = (text: string) => {
    setIntroduction(text);
    setShowAIModal(false);
    setAiInput("");
    setAiStyle("auto");
    setAiVersions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!introduction || skills.length === 0) {
      alert("자기소개와 스킬은 필수 입력 항목입니다.");
      return;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/profiles/my`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          introduction,
          skills: skills.join(", "),
          portfolio_url: portfolioUrl,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          is_profile_public: isProfilePublic,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("프로필이 성공적으로 저장되었습니다!");
        router.push("/mypage");
      } else {
        alert(data.message || "프로필 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-md my-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">인재 프로필 등록</h1>
      <p className="mb-8 text-gray-600">
        나만의 프로필을 작성하여 소상공인들에게 나를 소개하세요!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 자기소개 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="introduction"
              className="block text-sm font-medium text-gray-700"
            >
              자기소개 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI로 작성하기
            </button>
          </div>
          <textarea
            id="introduction"
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            rows={6}
            placeholder="나의 강점, 경험, 관심사 등을 자유롭게 작성해주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 스킬 */}
        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            보유 스킬 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              id="skills"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddSkill())
              }
              placeholder="예: Figma, React, Python (입력 후 Enter)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 포트폴리오 URL */}
        <div>
          <label
            htmlFor="portfolio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            포트폴리오 URL
          </label>
          <input
            type="url"
            id="portfolio"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://myportfolio.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label
            htmlFor="github"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            GitHub URL
          </label>
          <input
            type="url"
            id="github"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 프로필 공개 여부 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={isProfilePublic}
            onChange={(e) => setIsProfilePublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
            내 프로필을 공개하여 인재 찾기에 표시합니다
          </label>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.push("/mypage")}
            className="mr-4 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "프로필 저장하기"}
          </button>
        </div>
      </form>

      {/* AI 자기소개 생성 모달 */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">AI 자기소개 작성</h2>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setAiInput("");
                    setAiStyle("auto");
                    setAiVersions([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                간단한 키워드나 짧은 문장을 입력하면 AI가 자연스러운 자기소개로 확장해드립니다.
              </p>
            </div>

            <div className="p-6">
              {/* 입력 영역 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 또는 자기소개 초안
                </label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder='예: "성실한 학생입니다" 또는 긴 자기소개 초안을 입력하세요'
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={aiGenerating}
                />
              </div>

              {/* 스타일 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생성 스타일
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiStyle("auto")}
                    disabled={aiGenerating}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition ${
                      aiStyle === "auto"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    자동
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiStyle("simple")}
                    disabled={aiGenerating}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition ${
                      aiStyle === "simple"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    간단 (2-3줄)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiStyle("detailed")}
                    disabled={aiGenerating}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition ${
                      aiStyle === "detailed"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    상세 (1-2문단)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiStyle("professional")}
                    disabled={aiGenerating}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition ${
                      aiStyle === "professional"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    전문적 (여러문단)
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {aiStyle === "auto" && "입력 길이에 따라 자동으로 조절됩니다"}
                  {aiStyle === "simple" && "짧고 간결한 2-3줄 자기소개를 생성합니다"}
                  {aiStyle === "detailed" && "1-2문단의 상세한 자기소개를 생성합니다"}
                  {aiStyle === "professional" && "여러 문단의 전문적인 자기소개를 생성합니다"}
                </p>
              </div>

              {/* 생성 버튼 */}
              <div className="mb-6">
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating || !aiInput.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  {aiGenerating ? "AI가 작성 중..." : "✨ AI로 자기소개 생성하기"}
                </button>
              </div>

              {/* 로딩 상태 */}
              {aiGenerating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">AI가 자기소개를 작성하고 있습니다...</p>
                </div>
              )}

              {/* 생성된 버전들 */}
              {!aiGenerating && aiVersions.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    생성된 자기소개 (선택하면 자동으로 입력됩니다)
                  </p>
                  {aiVersions.map((version, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition"
                      onClick={() => handleSelectAIVersion(version.text)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {version.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAIVersion(version.text);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          선택
                        </button>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{version.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 안내 메시지 */}
              {!aiGenerating && aiVersions.length === 0 && aiInput === "" && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="mb-2">위에 키워드를 입력하고 생성 버튼을 눌러보세요.</p>
                  <p className="text-sm text-gray-400">
                    예: "성실한 학생", "디자인에 열정적", "팀워크 중시"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
