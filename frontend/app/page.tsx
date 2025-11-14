/**
 * Next.js 13+ (App Router)에서는 'app/page.tsx' 파일이
 * 웹사이트의 메인 페이지 (경로: '/')를 담당합니다.
 * 'index.html'의 <body> 내용을 여기에 붙여넣습니다.
 */

// 'class'를 'className'으로, 'style' 속성 등을 React에 맞게 수정했습니다.
import Link from "next/link";
export default function Home() {
  return (
    <>
      {/* 1. 헤더 (네비게이션 바) */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">이음</span>
                <span className="ml-2 text-sm text-gray-500">
                  지역과 인재를 잇다
                </span>
              </Link>
            </div>

            {/* 네비게이션 메뉴 (데스크탑) */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
              >
                프로젝트 찾기
              </a>
              <a
                href="#"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                인재 등록하기
              </a>
              <Link
                href="/guide"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                이용가이드
              </Link>
            </div>

            {/* 로그인/회원가입 (데스크탑) */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
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
            </div>

            {/* 모바일 메뉴 버튼 (나중에 JS로 기능 구현) */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed. */}
                <svg
                  className="block h-6 w-6"
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
                {/* Icon when menu is open. */}
                <svg
                  className="hidden h-6 w-6"
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
      </header>

      {/* 2. 메인 콘텐츠 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 2.1. 히어로 섹션 (검색) */}
        <section className="text-center bg-white p-8 sm:p-12 rounded-lg shadow-md mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            우리 동네 사장님
            <span className="text-blue-600"> 전문 인재가 도와드려요!</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            필요한 스킬을 검색해 보세요. 지금 바로 경험 많은 학생 인재들을
            만날 수 있습니다.
          </p>

          {/* 검색창 */}
          <div className="mt-8 max-w-xl mx-auto flex">
            <input
              type="text"
              placeholder="#로고디자인, #SNS마케팅, #영상편집..."
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

        {/* 2.2. 프로젝트 목록 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            새로 등록된 프로젝트
          </h2>

          {/* 프로젝트 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 카드 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    디자인
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    50,000원
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  신메뉴 홍보용 포스터 디자인
                </h3>
                <p className="mt-1 text-sm text-gray-600">박사장 떡볶이</p>
                <p className="mt-3 text-sm text-gray-700 h-16 overflow-hidden">
                  이번에 새로 나온 '로제 떡볶이' 홍보용 인스타그램 카드뉴스 및
                  포스터 디자인이 필요합니다. 레트로 감성으로...
                </p>

                {/* 스킬 태그 */}
                <div className="mt-4">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #포토샵
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #일러스트레이터
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #SNS디자인
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <a
                  href="#"
                  className="w-full text-center inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  상세보기 및 지원하기
                </a>
              </div>
            </div>

            {/* 카드 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    개발
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    재능기부
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  카페 메뉴 소개 랜딩페이지 제작
                </h3>
                <p className="mt-1 text-sm text-gray-600">김사장 스페셜티</p>
                <p className="mt-3 text-sm text-gray-700 h-16 overflow-hidden">
                  저희 스페셜티 원두를 소개하는 간단한 1페이지 짜리
                  웹사이트(랜딩페이지)가 필요합니다. 템플릿 수정 가능...
                </p>

                {/* 스킬 태그 */}
                <div className="mt-4">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #HTML/CSS
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #JavaScript
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #웹퍼블리싱
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <a
                  href="#"
                  className="w-full text-center inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  상세보기 및 지원하기
                </a>
              </div>
            </div>

            {/* 카드 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    영상/마케팅
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    건당 30,000원
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  유튜브 쇼츠 편집 (주 2회)
                </h3>
                <p className="mt-1 text-sm text-gray-600">오사장 공방</p>
                <p className="mt-3 text-sm text-gray-700 h-16 overflow-hidden">
                  공방에서 도자기 만드는 과정을 찍은 원본 영상을 1분 내외의
                  쇼츠/릴스 영상으로 편집해주실 분을 찾습니다. 자막 작업...
                </p>

                {/* 스킬 태그 */}
                <div className="mt-4">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #영상편집
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #프리미어프로
                  </span>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                    #쇼츠
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <a
                  href="#"
                  className="w-full text-center inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  상세보기 및 지원하기
                </a>
              </div>
            </div>
          </div>
          {/* /그리드 끝 */}
        </section>
      </main>

      {/* 3. 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 이음 (Team. 징검다리) - 캡스톤 디자인 프로젝트</p>
          <p className="mt-1">
            본 사이트는 포트폴리오 목적으로 제작되었으며, 상업적 용도로
            사용되지 않습니다.
          </p>
        </div>
      </footer>
    </>
  );
}

