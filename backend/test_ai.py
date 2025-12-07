"""
AI 자기소개 생성 기능 테스트 스크립트
"""
import requests
import json

API_URL = "http://localhost:5000"

def test_ai_generate_intro():
    """AI 자기소개 생성 API 테스트"""
    print("=" * 60)
    print("AI 자기소개 생성 테스트")
    print("=" * 60)

    # 테스트 케이스들
    test_cases = [
        "성실한 학생입니다",
        "React 개발에 관심 많음",
        "디자인에 열정적",
        "팀워크 중시하는 개발자",
    ]

    for i, user_input in enumerate(test_cases, 1):
        print(f"\n테스트 케이스 {i}: '{user_input}'")
        print("-" * 60)

        try:
            response = requests.post(
                f"{API_URL}/ai/generate-intro",
                json={"input": user_input},
                headers={"Content-Type": "application/json"},
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                print("✅ 생성 성공!")

                for version in data.get("versions", []):
                    print(f"\n📝 {version['label']}:")
                    print(f"   {version['text']}")
            else:
                print(f"❌ 생성 실패: {response.status_code}")
                print(f"   {response.json()}")

        except requests.exceptions.ConnectionError:
            print("❌ 서버 연결 실패! Flask 서버가 실행 중인지 확인하세요.")
            print("   실행 명령: cd backend && python run.py")
            break
        except Exception as e:
            print(f"❌ 오류 발생: {e}")

    print("\n" + "=" * 60)
    print("테스트 완료!")
    print("=" * 60)

if __name__ == "__main__":
    test_ai_generate_intro()
