"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 올바른 import 경로

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // 검색 실행 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // 검색어와 함께 검색 페이지로 이동 (URL 인코딩 처리)
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      {/* 2.1. 히어로 섹션 (검색) */}
      <section className="text-center bg-white p-8 sm:p-12 rounded-lg shadow-md mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          우리 동네 사장님,
          <span className="text-blue-600"> 전문 인재가 도와드려요!</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          필요한 스킬을 검색해 보세요. 지금 바로 경험 많은 학생 인재들을 만날
          수 있습니다.
        </p>

        {/* 검색창 (form 태그로 감싸서 엔터키 지원) */}
        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        </form>
      </section>

      {/* 2.2. 프로젝트 목록 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          새로 등록된 프로젝트
        </h2>

        {/* 프로젝트 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 카드 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col">
            <div className="p-6 flex-grow">
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col">
            <div className="p-6 flex-grow">
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
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col">
            <div className="p-6 flex-grow">
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
    </>
  );
}