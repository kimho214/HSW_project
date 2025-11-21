"use client";

// 🔴 '김호'님의 백엔드 API에서 받아올 학생 프로필 데이터 타입 (임시)
interface TalentProfile {
  id: number;
  username: string;
  introduction: string;
  skills: string[];
  // avatarUrl?: string; // (선택) 프로필 사진
}

// 🔴 카드 1개에 대한 props 타입
interface TalentCardProps {
  profile: TalentProfile;
}

export default function TalentCard({ profile }: TalentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl flex flex-col">
      {/* 1. 프로필 상단 (임시 이미지 + 이름) */}
      <div className="p-6 pb-2">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {/* 임시 아바타 */}
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <span className="text-xl font-medium text-blue-600">
                {profile.username.charAt(0)}
              </span>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {profile.username}
            </h3>
            <p className="text-sm text-gray-500">
              {/* 🔴 TODO: 전공 데이터 추가 */}
              컴퓨터공학과 4학년 (임시)
            </p>
          </div>
        </div>
      </div>

      {/* 2. 소개 및 스킬 (카드 본문) */}
      <div className="p-6 pt-4 flex-grow">
        <p className="text-sm text-gray-700 h-16 overflow-hidden">
          {profile.introduction}
        </p>

        {/* 스킬 태그 */}
        <div className="mt-4">
          {profile.skills.slice(0, 3).map((skill) => ( // 🔴 최대 3개까지만 표시
            <span
              key={skill}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-500 mr-2 mb-2">
              +{profile.skills.length - 3}개
            </span>
          )}
        </div>
      </div>

      {/* 3. 상세보기 버튼 */}
      <div className="bg-gray-50 px-6 py-4">
        <a
          href="#" // 🔴 TODO: 상세 프로필 페이지로 연결 (예: /profile/{profile.id})
          className="w-full text-center inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          포트폴리오 보기
        </a>
      </div>
    </div>
  );
}