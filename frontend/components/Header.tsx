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
  const [isMyMenuOpen, setIsMyMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("GUEST");
  const [userName, setUserName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>(""); // 학생: 이름, 사장: 상호명
  const [loading, setLoading] = useState(true);

  // 🔴 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      try {
        // JWT 토큰 구조 검증
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token structure");
        }

        // JWT 토큰 디코딩
        const payload = JSON.parse(atob(parts[1]));

        // 토큰 만료 검증
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // 토큰 만료됨
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          setUserRole("GUEST");
          return;
        }

        setUserRole(payload.role as UserRole);
        setUserName(payload.email || "사용자");

        // 역할별 표시 이름 설정
        if (payload.role === "STUDENT") {
          setDisplayName(payload.name || "학생");
        } else if (payload.role === "BUSINESS") {
          setDisplayName(payload.business_name || "사업자");
        }

      } catch (error) {
        // 토큰 파싱 실패 시 쿠키 삭제 및 게스트로 설정
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
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
    setDisplayName("");
    router.push("/");
    window.location.reload();
  };

  // 메뉴 아이템 정의 (보여줄 역할 지정)
  const navItems = [
    {
      href: "/projects",
      label: "프로젝트 찾기",
      roles: ["GUEST", "STUDENT", "BUSINESS"], // 학생이 프로젝트를 찾음
    },
    {
      href: "/talents",
      label: "인재 찾기",
      roles: ["GUEST", "BUSINESS", "STUDENT"], // 사장님이 인재를 찾음
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
        <div className="flex items-center h-16">
          {/* 1. 로고 - 고정 너비 영역 */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">이음</span>
              <span className="ml-2 text-sm text-gray-500 hidden md:block">
                지역과 인재를 잇다
              </span>
            </Link>
          </div>

          {/* 2. 데스크탑 메뉴 (필터링된 메뉴만 표시) - 중앙 정렬 */}
          <div className="hidden sm:flex sm:flex-1 sm:justify-center">
            <div className="flex space-x-8">
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
          </div>

          {/* 3. 로그인/회원가입 또는 사용자 정보 - 우측 고정 영역 */}
          <div className="hidden sm:flex sm:flex-1 sm:justify-end sm:items-center space-x-2">
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
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  <strong>{userRole === "STUDENT" ? "학생" : "사장"}</strong>
                  {" | "}
                  {displayName}
                </span>

                {/* 마이페이지 드롭다운 */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsMyMenuOpen(true)}
                  onMouseLeave={() => setIsMyMenuOpen(false)}
                >
                  <button
                    onClick={() => setIsMyMenuOpen(!isMyMenuOpen)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <span>마이페이지</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isMyMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isMyMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48 z-50">
                      <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200">
                        <Link
                          href="/mypage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMyMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            내 정보
                          </div>
                        </Link>
                        <Link
                          href="/chats"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMyMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            채팅
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
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
            <div className="px-5 space-y-2">
              {userRole === "GUEST" ? (
                <div className="flex items-center space-x-2">
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
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-700 text-center py-2">
                    <strong>{userRole === "STUDENT" ? "학생" : "사장"}</strong>
                    {" | "}
                    {displayName}
                  </div>
                  <Link
                    href="/mypage"
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/chats"
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    채팅
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}