"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 사용자 역할 타입 정의
type UserRole = "GUEST" | "STUDENT" | "BUSINESS";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("GUEST");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 🔴 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      try {
        // JWT 토큰 디코딩
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role as UserRole);
        setUserName(payload.email || "사용자");
        console.log("로그인 상태:", payload);
      } catch (error) {
        console.error("토큰 파싱 에러:", error);
        setUserRole("GUEST");
      }
    }
    setLoading(false);
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserRole("GUEST");
    setUserName("");
    router.push("/");
    window.location.reload();
  };

  // 메뉴 아이템 정의 (보여줄 역할 지정)
  const navItems = [
    {
      href: "/projects",
      label: "프로젝트 찾기",
      roles: ["GUEST", "STUDENT"], // 학생이 프로젝트를 찾음
    },
    {
      href: "/talents",
      label: "인재 찾기",
      roles: ["GUEST", "BUSINESS"], // 사장님이 인재를 찾음
    },
    {
      href: "/projects/new",
      label: "프로젝트 등록",
      roles: ["BUSINESS"], // 사장님만 가능
    },
    {
      href: "/profile",
      label: "인재 등록",
      roles: ["STUDENT"], // 학생만 가능
    },
    {
      href: "/guide",
      label: "이용가이드",
      roles: ["GUEST", "STUDENT", "BUSINESS"], // 모두 가능
    },
  ];

  // 🔴 현재 역할에 맞는 메뉴만 필터링
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">이음</span>
              <span className="ml-2 text-sm text-gray-500 hidden md:block">
                지역과 인재를 잇다
              </span>
            </Link>
          </div>

          {/* 2. 데스크탑 메뉴 (필터링된 메뉴만 표시) */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {loading ? (
              <span className="text-sm text-gray-500">로딩 중...</span>
            ) : (
              visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>

          {/* 3. 로그인/회원가입 또는 사용자 정보 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            {loading ? null : userRole === "GUEST" ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  <strong>{userRole === "STUDENT" ? "학생" : "사장님"}</strong>
                  {" | "}
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>

          {/* 4. 모바일 메뉴 버튼 */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 5. 모바일 메뉴 (펼쳐졌을 때) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5 space-x-2">
              {userRole === "GUEST" ? (
                <>
                  <Link
                    href="/login"
                    className="flex-1 w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}