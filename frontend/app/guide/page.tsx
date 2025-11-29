/**
 * 이용가이드 페이지 (경로: /guide)
 * - 학생과 소상공인별로 이용 절차를 안내합니다.
 */

export default function GuidePage() {
    return (
      <>
        {/* 1. 헤더 (메인 페이지와 동일한 헤더가 layout.tsx에 의해 자동으로 적용됩니다) */}
        {/* layout.tsx가 이 페이지를 감싸고 있습니다. */}
  
        {/* 2. 메인 콘텐츠 */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white p-8 sm:p-12 rounded-lg shadow-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-center">
              <span className="text-blue-600">'이음'</span> 이용가이드
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center">
              '이음' 플랫폼은 학생 인재와 지역 소상공인을 연결합니다.
              <br />
              아래에서 역할을 선택하고 이용 절차를 확인해 보세요.
            </p>
  
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* 2.1. 학생 인재 가이드 */}
              <section>
                <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-200">
                  🎓 학생 인재님 (Talent)
                </h2>
                <ol className="relative border-l border-gray-200 space-y-8">
                  {/* 1단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-blue-800">1</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      회원가입 및 프로필 작성
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      '학생 회원'으로 가입하고, 본인의 전공, 스킬, 경험을 보여줄 수
                      있는 프로필과 포트폴리오를 등록합니다. 프로필이 구체적일수록
                      프로젝트 매칭 확률이 높아집니다.
                    </p>
                  </li>
                  {/* 2단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-blue-800">2</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      프로젝트 탐색 및 지원
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      메인 페이지에서 본인의 스킬과 일치하는 프로젝트를
                      탐색합니다. 마음에 드는 프로젝트를 발견하면 '지원하기'
                      버튼을 눌러 간단한 지원 동기와 함께 프로필을 제출합니다.
                    </p>
                  </li>
                  {/* 3단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-blue-800">3</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      프로젝트 수행 및 완료
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      소상공인과 매칭이 완료되면, 약속된 기간 동안 프로젝트를
                      성실하게 수행합니다. 완료 후, 소상공인에게 결과물을
                      전달하고 '완료' 확인을 받습니다.
                    </p>
                  </li>
                  {/* 4단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-blue-800">4</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      경험과 포트폴리오 획득
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      프로젝트 완료 후, 소상공인으로부터 받은 리뷰와 결과물은
                      '이음' 프로필에 누적되어 강력한 포트폴리오가 됩니다. 실제
                      경험을 쌓고 취업 경쟁력을 높여보세요!
                    </p>
                  </li>
                </ol>
              </section>
  
              {/* 2.2. 소상공인 가이드 */}
              <section>
                <h2 className="text-2xl font-bold text-green-700 mb-6 pb-2 border-b-2 border-green-200">
                  💼 사장님 (Business)
                </h2>
                <ol className="relative border-l border-gray-200 space-y-8">
                  {/* 1단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-green-800">1</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      회원가입 및 프로젝트 등록
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      '사장님 회원'으로 가입하고, 도움이 필요한 프로젝트를
                      등록합니다. (예: 로고 디자인, SNS 홍보물 제작). 필요한
                      스킬, 예상 보상, 작업 기간을 명확히 적어주세요.
                    </p>
                  </li>
                  {/* 2단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-green-800">2</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      지원자 검토 및 매칭
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      프로젝트에 지원한 학생들의 프로필과 포트폴리오를 검토합니다.
                      가게의 비전과 가장 잘 맞는 학생 인재를 선택하여 '매칭
                      수락'을 진행합니다.
                    </p>
                  </li>
                  {/* 3단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-green-800">3</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      프로젝트 관리 및 피드백
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      학생과 소통하며 프로젝트가 잘 진행되도록 관리합니다. 작업
                      진행 상황을 확인하고, 필요한 피드백을 제공하여 더 나은
                      결과물을 만들어갑니다.
                    </p>
                  </li>
                  {/* 4단계 */}
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-8 ring-white">
                      <span className="font-bold text-green-800">4</span>
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      결과물 확인 및 리뷰 작성
                    </h3>
                    <p className="mt-2 text-base font-normal text-gray-600">
                      최종 결과물을 전달받고 '프로젝트 완료'를 확인합니다. 함께 일한
                      학생에게 리뷰를 작성해 주시면, 해당 학생의 성장에 큰 도움이
                      됩니다.
                    </p>
                  </li>
                </ol>
              </section>
            </div>
          </div>
        </main>
  
        {/* 3. 푸터 (메인 페이지와 동일한 푸터가 layout.tsx에 의해 자동으로 적용됩니다) */}
      </>
    );
  }