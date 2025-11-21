from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_db
import jwt
import datetime

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = "mysecretkey"  # 나중에 .env로 분리 가능


# ============================
#   회원가입 API
# ============================
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    
    # 🔍 디버그: 받은 데이터 출력
    print("=" * 50)
    print("받은 데이터:", data)
    print("=" * 50)

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")  # "STUDENT" or "BUSINESS"

    # 공통 필수 필드 검증
    if not email or not password or not role:
        print("❌ 필수 필드 누락!")
        return jsonify({"message": "missing fields"}), 400

    # 역할별 추가 필드 검증
    if role == "STUDENT":
        name = data.get("name")
        print(f"학생 회원가입 - name: {name}")
        if not name:
            print("❌ 학생 이름 누락!")
            return jsonify({"message": "name is required for students"}), 400
    elif role == "BUSINESS":
        business_name = data.get("business_name")
        address = data.get("address")
        print(f"소상공인 회원가입 - business_name: {business_name}, address: {address}")
        if not business_name or not address:
            print("❌ 상호명 또는 주소 누락!")
            return jsonify({"message": "business_name and address are required for businesses"}), 400
    else:
        print(f"❌ 잘못된 role: {role}")
        return jsonify({"message": "invalid role"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 1. users 테이블에 기본 정보 삽입
        sql_user = """
        INSERT INTO users (email, password, role)
        VALUES (%s, %s, %s)
        """
        print(f"📝 users 테이블에 삽입 시도...")
        cursor.execute(sql_user, (email, hashed_pw, role))
        user_id = cursor.lastrowid  # 방금 생성된 user의 ID
        print(f"✅ users 테이블 삽입 성공! user_id: {user_id}")

        # 2. 역할별로 상세 정보 테이블에 삽입
        if role == "STUDENT":
            sql_student = """
            INSERT INTO students (user_id, name)
            VALUES (%s, %s)
            """
            print(f"📝 students 테이블에 삽입 시도...")
            cursor.execute(sql_student, (user_id, name))
            print(f"✅ students 테이블 삽입 성공!")
        elif role == "BUSINESS":
            sql_business = """
            INSERT INTO businesses (user_id, business_name, address)
            VALUES (%s, %s, %s)
            """
            print(f"📝 businesses 테이블에 삽입 시도...")
            cursor.execute(sql_business, (user_id, business_name, address))
            print(f"✅ businesses 테이블 삽입 성공!")

        conn.commit()
        print("✅ 회원가입 완료!")
        return jsonify({"message": "success"}), 201

    except Exception as e:
        print("=" * 50)
        print(f"❌❌❌ 에러 발생!")
        print(f"에러 타입: {type(e).__name__}")
        print(f"에러 메시지: {str(e)}")
        print("=" * 50)
        if conn:
            conn.rollback()  # 에러 발생 시 롤백
        return jsonify({"message": "error", "detail": str(e)}), 400
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



# ============================
#   로그인 API
# ============================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    print("=" * 50)
    print("🔐 로그인 시도")
    print(f"받은 이메일: {data.get('email')}")
    print(f"받은 비밀번호 길이: {len(data.get('password', ''))}")
    print("=" * 50)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        print("❌ 이메일 또는 비밀번호 누락")
        return jsonify({"message": "missing fields"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 이메일로 유저 찾기
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        
        print(f"DB 조회 결과: {user is not None}")
        if user:
            print(f"찾은 사용자 - ID: {user['id']}, Role: {user['role']}")
            print(f"저장된 해시: {user['password'][:50]}...")

        if not user:
            print("❌ 이메일을 찾을 수 없음")
            return jsonify({"message": "email not found"}), 404

        # 비밀번호 검증
        is_valid = check_password_hash(user["password"], password)
        print(f"비밀번호 검증 결과: {is_valid}")
        
        if not is_valid:
            print("❌ 비밀번호 불일치")
            return jsonify({"message": "wrong password"}), 401
            return jsonify({"message": "wrong password"}), 401

        # 역할별 상세 정보 가져오기
        user_detail = {}
        if user["role"] == "STUDENT":
            cursor.execute("SELECT name FROM students WHERE user_id=%s", (user["id"],))
            student = cursor.fetchone()
            if student:
                user_detail["name"] = student["name"]
        elif user["role"] == "BUSINESS":
            cursor.execute("SELECT business_name, address FROM businesses WHERE user_id=%s", (user["id"],))
            business = cursor.fetchone()
            if business:
                user_detail["business_name"] = business["business_name"]
                user_detail["address"] = business["address"]

        # JWT 토큰 생성
        payload = {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "success",
            "token": token,
            "role": user["role"],
            "user_detail": user_detail
        }), 200

    except Exception as e:
        return jsonify({"message": "error", "detail": str(e)}), 500
    finally:
        cursor.close()
        conn.close()