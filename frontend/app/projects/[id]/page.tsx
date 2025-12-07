"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
  business_email: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/projects/${id}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
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

  const handleApply = async () => {
    // 토큰 가져오기
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 사용자 역할 확인 (학생만 지원 가능)
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);

      if (payload.role !== 'STUDENT') {
        alert('학생만 지원할 수 있습니다.');
        return;
      }
    } catch (err) {
      alert('사용자 정보를 확인하는 중 오류가 발생했습니다.');
      return;
    }

    setApplying(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: id,
          cover_letter: coverLetter,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("지원이 완료되었습니다!");
        setCoverLetter("");
      } else {
        if (response.status === 409) { // 409 Conflict: 이미 지원한 경우
          alert("이미 지원한 프로젝트입니다.");
        } else {
          alert(data.message || "지원에 실패했습니다.");
        }
      }
    } catch (err) {
      console.error("지원 실패:", err);
      alert("지원 중 오류가 발생했습니다.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-500">프로젝트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-500">{error || "프로젝트를 찾을 수 없습니다."}</p>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const skills = project.required_skills
    ? project.required_skills.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-4">
      {/* 프로젝트 상세 정보 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 break-words">
              {project.business_name || "회사명 미정"}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
              project.status === "OPEN"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {project.status === "OPEN" ? "모집중" : "마감"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">지역</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
              {project.location || "지역 미정"}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">급여</p>
            <p className="text-sm sm:text-base font-medium text-blue-600 break-words">
              {project.salary || "급여 협의"}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">기간</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
              {project.duration || "기간 협의"}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">등록일</p>
            <p className="text-sm sm:text-base font-medium text-gray-900">
              {new Date(project.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
            프로젝트 설명
          </h2>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
            {project.description}
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
            필요 스킬
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium break-words"
              >
                {skill.startsWith("#") ? skill : `#${skill}`}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 sm:pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
            업체 정보
          </h2>
          <p className="text-sm sm:text-base text-gray-700 break-words">
            <span className="font-medium">주소:</span>{" "}
            {project.business_address || "주소 정보 없음"}
          </p>
          <p className="text-sm sm:text-base text-gray-700 break-words">
            <span className="font-medium">연락처:</span>{" "}
            {project.business_email || "연락처 정보 없음"}
          </p>
        </div>
      </div>

      {/* 지원하기 섹션 */}
      {project.status === "OPEN" && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            이 프로젝트에 지원하기
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            자기소개 및 지원동기를 작성해주세요.
          </p>

          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="cover-letter"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
            >
              자기소개 및 지원동기
            </label>
            <textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              placeholder="본인의 강점과 이 프로젝트에 지원하는 이유를 자유롭게 작성해주세요."
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/projects")}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-700 hover:bg-gray-50 font-medium order-2 sm:order-1"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-md text-sm sm:text-base hover:bg-blue-700 font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {applying ? "지원 중..." : "지원하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
