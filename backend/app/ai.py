from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ==================================================
#   AI 자기소개 생성 API (POST /ai/generate-intro)
# ==================================================
@ai_bp.route("/generate-intro", methods=["POST"])
def generate_intro():
    """
    사용자가 입력한 키워드나 문장을 바탕으로 3가지 버전의 자기소개를 생성합니다.
    입력 길이와 스타일에 따라 자동으로 조절됩니다.
    """
    if not GEMINI_API_KEY:
        return jsonify({
            "message": "AI API key is not configured",
            "error": "GEMINI_API_KEY not set"
        }), 500

    data = request.get_json()
    user_input = data.get("input", "").strip()
    style = data.get("style", "auto")  # auto, simple, detailed, professional

    if not user_input:
        return jsonify({
            "message": "Input text is required",
            "error": "Missing 'input' field"
        }), 400

    # 입력이 너무 짧으면 안내
    if len(user_input) < 3:
        return jsonify({
            "message": "Input is too short",
            "error": "Please provide at least 3 characters"
        }), 400

    try:
        # Gemini 모델 설정 (빠르고 효율적인 최신 모델)
        model = genai.GenerativeModel('gemini-2.5-flash')

        # 입력 길이에 따른 자동 스타일 결정
        input_length = len(user_input)
        if style == "auto":
            if input_length <= 20:
                detected_style = "simple"
            elif input_length <= 100:
                detected_style = "detailed"
            else:
                detected_style = "professional"
        else:
            detected_style = style

        # 스타일별 프롬프트 생성
        if detected_style == "simple":
            # 짧은 입력: 2-3줄로 확장
            prompt = f"""당신은 대학생 자기소개 작성 전문가입니다.

사용자가 제공한 짧은 키워드나 문장을 바탕으로 프로젝트 지원 시 사용할 수 있는 자기소개 3가지 버전을 작성해주세요.

입력: "{user_input}"

요구사항:
1. 각 버전은 2-3줄 이내로 작성
2. 버전1: 전문적이고 공식적인 톤
3. 버전2: 친근하면서도 프로페셔널한 톤
4. 버전3: 간결하고 핵심만 담은 톤
5. 프로젝트 참여 의지와 강점을 자연스럽게 포함
6. 과장하지 않고 진정성 있게 작성
7. 한국어로 작성
8. 각 버전은 "버전1:", "버전2:", "버전3:" 형식으로 명확히 구분

출력 형식:
버전1: [전문적인 자기소개]

버전2: [친근한 자기소개]

버전3: [간결한 자기소개]
"""
        elif detected_style == "detailed":
            # 중간 입력: 1-2문단으로 확장
            prompt = f"""당신은 대학생 자기소개 작성 전문가입니다.

사용자가 제공한 자기소개 초안을 바탕으로 더 상세하고 매력적인 자기소개 3가지 버전을 작성해주세요.

입력: "{user_input}"

요구사항:
1. 각 버전은 1-2문단(4-6줄) 정도로 작성
2. 버전1: 전문적이고 상세한 톤 - 구체적인 경험과 역량 강조
3. 버전2: 친근하면서도 설득력 있는 톤 - 열정과 성장 의지 표현
4. 버전3: 간결하지만 임팩트 있는 톤 - 핵심 강점과 목표 명확히
5. 구체적인 예시나 경험을 포함하여 신뢰도 향상
6. 프로젝트 참여 의지와 기여 가능성 강조
7. 자연스러운 한국어로 작성
8. 각 버전은 "버전1:", "버전2:", "버전3:" 형식으로 명확히 구분

출력 형식:
버전1: [전문적이고 상세한 자기소개]

버전2: [친근하고 설득력 있는 자기소개]

버전3: [간결하고 임팩트 있는 자기소개]
"""
        else:  # professional
            # 긴 입력: 여러 문단으로 퀄리티 향상
            prompt = f"""당신은 대학생 자기소개 작성 전문가입니다.

사용자가 제공한 자기소개를 최고 퀄리티로 개선하여 3가지 버전으로 작성해주세요.

입력: "{user_input}"

요구사항:
1. 각 버전은 2-3문단(7-10줄) 정도로 작성
2. 버전1: 최상급 전문적 톤 - 성과와 역량을 구체적 수치/예시로 증명
3. 버전2: 스토리텔링 중심 - 성장 과정과 배움의 여정을 감동적으로 표현
4. 버전3: 임팩트와 비전 중심 - 미래 기여 가능성과 목표를 명확히
5. 문법, 어휘, 표현을 최고 수준으로 다듬기
6. 각 문단은 명확한 주제를 가지고 논리적으로 연결
7. 읽는 사람이 반드시 선택하고 싶게 만드는 설득력
8. 자연스러운 한국어로 작성
9. 각 버전은 "버전1:", "버전2:", "버전3:" 형식으로 명확히 구분

출력 형식:
버전1: [최상급 전문적 자기소개 - 2-3문단]

버전2: [스토리텔링 중심 자기소개 - 2-3문단]

버전3: [임팩트와 비전 중심 자기소개 - 2-3문단]
"""

        # AI 생성 요청
        response = model.generate_content(prompt)
        generated_text = response.text

        # 응답 파싱 (버전별로 분리)
        versions = parse_versions(generated_text)

        if len(versions) < 3:
            # 파싱 실패 시 전체 텍스트 반환
            return jsonify({
                "message": "Generated introduction (parsing failed)",
                "versions": [
                    {"label": "생성된 자기소개", "text": generated_text.strip()}
                ]
            }), 200

        return jsonify({
            "message": "Successfully generated introductions",
            "versions": versions
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Failed to generate introduction",
            "error": str(e)
        }), 500


def parse_versions(text):
    """
    생성된 텍스트에서 3가지 버전을 파싱합니다.
    """
    versions = []

    # 버전 레이블과 매핑
    labels = ["전문적인 자기소개", "친근한 자기소개", "간결한 자기소개"]

    # 텍스트를 줄 단위로 분리
    lines = text.strip().split('\n')

    current_version = None
    current_text = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 버전 구분자 찾기
        if line.startswith("버전1:") or line.startswith("**버전1:**"):
            if current_version is not None and current_text:
                versions.append({
                    "label": labels[current_version - 1] if current_version <= 3 else f"버전{current_version}",
                    "text": " ".join(current_text).strip()
                })
            current_version = 1
            current_text = [line.replace("버전1:", "").replace("**버전1:**", "").strip()]
        elif line.startswith("버전2:") or line.startswith("**버전2:**"):
            if current_version is not None and current_text:
                versions.append({
                    "label": labels[current_version - 1] if current_version <= 3 else f"버전{current_version}",
                    "text": " ".join(current_text).strip()
                })
            current_version = 2
            current_text = [line.replace("버전2:", "").replace("**버전2:**", "").strip()]
        elif line.startswith("버전3:") or line.startswith("**버전3:**"):
            if current_version is not None and current_text:
                versions.append({
                    "label": labels[current_version - 1] if current_version <= 3 else f"버전{current_version}",
                    "text": " ".join(current_text).strip()
                })
            current_version = 3
            current_text = [line.replace("버전3:", "").replace("**버전3:**", "").strip()]
        elif current_version is not None:
            # 현재 버전의 텍스트 추가
            current_text.append(line)

    # 마지막 버전 추가
    if current_version is not None and current_text:
        versions.append({
            "label": labels[current_version - 1] if current_version <= 3 else f"버전{current_version}",
            "text": " ".join(current_text).strip()
        })

    return versions
