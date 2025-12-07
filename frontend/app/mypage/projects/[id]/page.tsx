"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// 지원자 정보 타입 정의
interface Applicant {
  id: number;
  student_id: number; // 학생의 user_id
  student_name: string;
  student_email: string; // 채팅방 ID 생성에 사용
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  cover_letter: string;
  created_at: string;
}

// 프로젝트 정보 타입 정의
interface Project {
  id: number;
  title: string;
  description: string;
}

// 현재 로그인한 사용자 정보 타입 정의
interface UserInfo {
  role: string;
  email: string; // 사장님의 고유 ID (채팅방 ID 생성에 사용)
}

// 채팅방 ID 생성 함수 (mypage/page.tsx와 동일한 규칙)
const createChatRoomId = (userId1: string, userId2: string) => {
  // 각 ID의 앞뒤 공백을 제거하여 일관성을 보장합니다.
  const sortedIds = [userId1.trim(), userId2.trim()].sort();
  return sortedIds.join("_");
};

export default function ProjectApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    // 토큰에서 사용자 정보(사장님 ID) 추출
    try {
      // JWT payload는 Base64-URL 형식이므로, atob로 디코딩하기 전에 표준 Base64 형식으로 변환해야 합니다.
      const base64Url = token.split(".")[1];
      // 1. URL-safe 문자를 Base64 표준 문자로 변경합니다.
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // 2. 패딩을 추가하고, UTF-8 문자를 올바르게 디코딩합니다.
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

      const payload = JSON.parse(jsonPayload);
      if (payload.role !== "BUSINESS") {
        alert("접근 권한이 없습니다.");
        router.push("/");
        return;
      }
      setUserInfo(payload);
      fetchApplicants(token, projectId);
    } catch (err) {
      console.error("토큰 파싱 실패:", err);
      router.push("/login");
    }
  }, [projectId, router]);

  const fetchApplicants = async (token: string, id: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/applications/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
        setApplicants(data.applications || []);
      } else {
        setError(data.message || "지원자 정보를 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("지원자 정보 로딩 실패:", err);
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    const labels = { PENDING: "대기중", ACCEPTED: "승인됨", REJECTED: "거절됨" };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) return <div className="text-center py-12">로딩 중...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <button onClick={() => router.back()} className="text-blue-600 mb-4">
          &larr; 마이페이지로 돌아가기
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{project?.title}</h1>
        <p className="text-gray-600 mt-1">
          총 {applicants.length}명의 지원자가 있습니다.
        </p>

        <div className="mt-8 space-y-6">
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {applicant.student_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicant.student_email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      지원일:{" "}
                      {new Date(applicant.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(applicant.status)}
                    {/* 채팅하기 버튼 추가 */}
                    {userInfo && (
                      <Link
                        href={`/chat/${createChatRoomId(
                          userInfo.email,
                          applicant.student_email
                        )}?name=${encodeURIComponent(applicant.student_name)}`}
                        className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        채팅하기
                      </Link>
                    )}
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="text-sm text-blue-600 cursor-pointer">
                    자기소개서 보기
                  </summary>
                  <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded">
                    {applicant.cover_letter}
                  </p>
                </details>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              아직 지원자가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}