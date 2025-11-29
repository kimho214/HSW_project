"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  id: number;
  project_id: number;
  project_title: string;
  project_description: string;
  salary: string;
  location: string;
  business_name: string;
  business_id: string; // 실제로는 business의 이메일 (채팅방 ID 생성에 사용)
  status: string;
  created_at: string;
  cover_letter: string;
}

interface Project {
  id: number;
  title: string;
  description:string;
  location: string;
  salary: string;
  status: string;
  application_count: number;
  created_at: string;
}

interface UserInfo {
  role: string;
  email: string;
  name?: string;
  business_name?: string;
}

interface Statistics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

// 채팅방 ID를 생성하는 규칙입니다.
const createChatRoomId = (userId1: string, userId2: string) => {
  // 각 ID의 앞뒤 공백을 제거하여 일관성을 보장합니다.
  const sortedIds = [userId1.trim(), userId2.trim()].sort();
  return sortedIds.join("_");
};

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "stats" | "settings">("overview");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

    // JWT 토큰 디코딩하여 사용자 정보 추출
    try {
      // JWT payload는 Base64-URL 형식이므로, atob로 디코딩하기 전에 표준 Base64 형식으로 변환해야 합니다.
      const base64Url = token.split(".")[1];
      // 1. URL-safe 문자를 Base64 표준 문자로 변경합니다.
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // 2. 패딩을 추가하고, UTF-8 문자를 올바르게 디코딩합니다.
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      
      const payload = JSON.parse(jsonPayload);
      setUserInfo(payload);

      if (payload.role === "STUDENT") {
        fetchMyApplications(token);
      } else if (payload.role === "BUSINESS") {
        fetchMyProjects(token);
      }
    } catch (err) {
      console.error("토큰 파싱 실패:", err);
      alert("로그인 정보가 올바르지 않습니다.");
      router.push("/login");
    }
  }, []);

  const fetchMyApplications = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/applications/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);
      } else {
        setError(data.message || "지원 내역을 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("지원 내역 로딩 실패:", err);
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProjects = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/projects/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      } else {
        setError(data.message || "프로젝트 목록을 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("프로젝트 로딩 실패:", err);
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
      OPEN: "bg-blue-100 text-blue-800",
      CLOSED: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
    };

    const labels = {
      PENDING: "대기중",
      ACCEPTED: "승인됨",
      REJECTED: "거절됨",
      OPEN: "모집중",
      CLOSED: "마감",
      IN_PROGRESS: "진행중",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const calculateStats = (): Statistics => {
    if (userInfo?.role === "STUDENT") {
      return {
        total: applications.length,
        pending: applications.filter(app => app.status === "PENDING").length,
        accepted: applications.filter(app => app.status === "ACCEPTED").length,
        rejected: applications.filter(app => app.status === "REJECTED").length,
      };
    } else {
      const totalApplications = projects.reduce((sum, p) => sum + p.application_count, 0);
      return {
        total: projects.length,
        pending: projects.filter(p => p.status === "OPEN").length,
        accepted: projects.filter(p => p.status === "IN_PROGRESS").length,
        rejected: projects.filter(p => p.status === "CLOSED").length,
      };
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setChangingPassword(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      document.cookie = "token=; path=/; max-age=0";
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
            <p className="text-blue-100 text-lg">
              {userInfo?.role === "STUDENT"
                ? `안녕하세요, ${userInfo.name || userInfo.email}님`
                : `안녕하세요, ${userInfo?.business_name || userInfo?.email}님`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium transition"
            >
              프로필 편집
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === "overview"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>대시보드</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === "list"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{userInfo?.role === "STUDENT" ? "지원 현황" : "프로젝트 관리"}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === "stats"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>통계</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-6 py-4 text-center font-medium transition ${
              activeTab === "settings"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>설정</span>
            </div>
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[500px]">
        {/* 대시보드 탭 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {userInfo?.role === "STUDENT" ? "총 지원" : "총 프로젝트"}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {userInfo?.role === "STUDENT" ? "대기중" : "모집중"}
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {userInfo?.role === "STUDENT" ? "승인됨" : "진행중"}
                    </p>
                    <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {userInfo?.role === "STUDENT" ? "거절됨" : "마감"}
                    </p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 빠른 액세스 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">빠른 액세스</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">프로필 편집</p>
                    <p className="text-sm text-gray-600">내 정보 수정하기</p>
                  </div>
                </Link>

                <Link
                  href="/chats"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">채팅</p>
                    <p className="text-sm text-gray-600">대화 나누기</p>
                  </div>
                </Link>

                <Link
                  href={userInfo?.role === "STUDENT" ? "/projects" : "/projects/new"}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {userInfo?.role === "STUDENT" ? "프로젝트 찾기" : "프로젝트 등록"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userInfo?.role === "STUDENT" ? "새 기회 탐색하기" : "새 프로젝트 만들기"}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">최근 활동</h3>
              {userInfo?.role === "STUDENT" ? (
                applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>아직 활동 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{app.project_title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(app.created_at).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>아직 프로젝트가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-sm text-gray-600">
                            지원자 {project.application_count}명
                          </p>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 지원 현황 / 프로젝트 관리 탭 */}
        {activeTab === "list" && (
          <div>
            {userInfo?.role === "STUDENT" ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  내 지원 현황 ({applications.length}건)
                </h2>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">아직 지원한 프로젝트가 없습니다.</p>
                    <Link
                      href="/projects"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      프로젝트 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Link
                              href={`/projects/${app.project_id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {app.project_title}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              {app.business_name}
                            </p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {app.project_description}
                        </p>

                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {app.location || "지역 미정"}</span>
                          <span>💰 {app.salary || "급여 협의"}</span>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm text-gray-500">
                            지원일: {new Date(app.created_at).toLocaleDateString("ko-KR")}
                          </p>
                          {app.cover_letter && (
                            <details className="mt-2">
                              <summary className="text-sm text-blue-600 cursor-pointer">
                                자기소개서 보기
                              </summary>
                              <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded">
                                {app.cover_letter}
                              </p>
                            </details>
                          )}
                          {app.status === "ACCEPTED" && userInfo && (
                            <div className="mt-3">
                              <Link
                                href={`/chat/${createChatRoomId(userInfo.email, app.business_id)}?name=${encodeURIComponent(app.business_name)}`}
                                className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                              >
                                채팅하기
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    내 프로젝트 ({projects.length}개)
                  </h2>
                  <Link
                    href="/projects/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    새 프로젝트 등록
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">등록한 프로젝트가 없습니다.</p>
                    <Link
                      href="/projects/new"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      프로젝트 등록하기
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-4">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {project.title}
                            </Link>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(project.status)}
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                              지원자 {project.application_count}명
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {project.location || "지역 미정"}</span>
                          <span>💰 {project.salary || "급여 협의"}</span>
                        </div>

                        <div className="border-t pt-3 mt-3 flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            등록일: {new Date(project.created_at).toLocaleDateString("ko-KR")}
                          </p>
                          <Link
                            href={`/mypage/projects/${project.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            지원자 목록 보기 →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 통계 탭 */}
        {activeTab === "stats" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">통계</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {userInfo?.role === "STUDENT" ? "지원 현황 분포" : "프로젝트 현황 분포"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {userInfo?.role === "STUDENT" ? "대기중" : "모집중"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.pending} / {stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {userInfo?.role === "STUDENT" ? "승인됨" : "진행중"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.accepted} / {stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {userInfo?.role === "STUDENT" ? "거절됨" : "마감"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.rejected} / {stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 요약</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {userInfo?.role === "STUDENT" ? "총 지원 건수" : "총 프로젝트 수"}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                  </div>
                  {userInfo?.role === "BUSINESS" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">총 지원자 수</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {projects.reduce((sum, p) => sum + p.application_count, 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">성공률</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {stats.total === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>아직 통계 데이터가 없습니다.</p>
                <p className="text-sm mt-2">
                  {userInfo?.role === "STUDENT"
                    ? "프로젝트에 지원하면 통계가 표시됩니다."
                    : "프로젝트를 등록하면 통계가 표시됩니다."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* 계정 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">계정 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={userInfo?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계정 유형</label>
                  <input
                    type="text"
                    value={userInfo?.role === "STUDENT" ? "학생" : "사업자"}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                {userInfo?.role === "STUDENT" && userInfo.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <input
                      type="text"
                      value={userInfo.name}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                )}
                {userInfo?.role === "BUSINESS" && userInfo.business_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업자명</label>
                    <input
                      type="text"
                      value={userInfo.business_name}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">비밀번호 변경</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </div>

            {/* 위험 구역 */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-600 mb-4">위험 구역</h2>
              <p className="text-gray-600 mb-4">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              <button
                onClick={() => {
                  if (confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                    alert("계정 삭제 기능은 준비 중입니다.");
                  }
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                계정 삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
