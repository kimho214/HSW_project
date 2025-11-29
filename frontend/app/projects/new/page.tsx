"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 🔴 Next.js 13+에서는 next/navigation을 사용합니다.

export default function NewProjectPage() {
  const router = useRouter();

  // 폼 상태 관리
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [duration, setDuration] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);

  // 스킬 태그 추가 함수
  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      const newSkill = currentSkill.startsWith("#")
        ? currentSkill
        : `#${currentSkill}`;
      setSkills([...skills, newSkill]);
      setCurrentSkill("");
    }
  };

  // 스킬 태그 삭제 함수
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // 폼 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title || !description || skills.length === 0) {
      alert("필수 항목을 모두 입력해 주세요.");
      return;
    }

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

    const projectData = {
      title,
      description,
      location,
      salary,
      duration,
      required_skills: skills.join(", "), // 배열을 쉼표로 구분된 문자열로 변환
    };

    console.log("프로젝트 등록 시도:", projectData);

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("프로젝트가 성공적으로 등록되었습니다!");
        router.push("/projects"); // 프로젝트 목록으로 이동
      } else {
        alert(data.message || "프로젝트 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("프로젝트 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-md my-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        새 프로젝트 등록
      </h1>
      <p className="mb-8 text-gray-600">
        도움이 필요한 업무 내용을 자세히 적어주세요. 학생 인재들이 내용을 보고
        지원하게 됩니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 프로젝트 제목 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            프로젝트 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 카페 로고 디자인 의뢰합니다."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 2. 상세 설명 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            상세 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="구체적인 업무 내용, 원하는 결과물 스타일, 참고 자료 등을 적어주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 3. 필요 스킬 */}
        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            필요 스킬 (태그) <span className="text-red-500">*</span>
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
              placeholder="예: 포토샵, 영상편집 (입력 후 Enter)"
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

        {/* 4. 근무지, 급여, 기간 */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            근무 지역
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 서울 강남구"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="salary"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              급여
            </label>
            <input
              type="text"
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="예: 시급 10,000원 또는 협의"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              근무 기간
            </label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="예: 1개월, 3개월, 협의 가능"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-4 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "등록 중..." : "프로젝트 등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}