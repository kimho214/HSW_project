"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 1. 히어로 섹션 (서비스 소개) */}
      <section className="w-full text-center py-20 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          지역과 인재를 잇는 <br className="sm:hidden" />
          <span className="text-blue-600">가장 쉬운 방법</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          소상공인에게는 든든한 지원군을, <br className="sm:hidden" />
          대학생에게는 값진 실무 경험을 연결해 드립니다.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/projects"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            프로젝트 찾기
          </Link>
          <Link
            href="/talents"
            className="px-8 py-4 bg-white text-blue-600 border border-blue-200 font-bold rounded-lg shadow-sm hover:bg-blue-50 transition"
          >
            인재 찾기
          </Link>
        </div>
      </section>

      {/* 2. 특징 섹션 */}
      <section className="w-full py-16 px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          '이음'은 이런 점이 다릅니다
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">상생 협력</h3>
            <p className="text-gray-600">
              지역 사회 구성원들이 서로 돕고 함께 성장하는 선순환을 만듭니다.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-2">실무 경험</h3>
            <p className="text-gray-600">
              강의실 밖 진짜 세상의 문제를 해결하며 나만의 포트폴리오를 쌓으세요.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">디지털 전환</h3>
            <p className="text-gray-600">
              젊은 감각의 인재들과 함께 가게의 온라인 경쟁력을 높여보세요.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 이용 통계 (임시 데이터) */}
      <section className="w-full bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">150+</div>
            <div className="text-blue-100">등록된 프로젝트</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">300+</div>
            <div className="text-blue-100">활동 중인 인재</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-blue-100">매칭 만족도</div>
          </div>
        </div>
      </section>
    </div>
  );
}