from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_db
from functools import wraps
import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")


# ============================
#   JWT 토큰 검증 데코레이터
# ============================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"message": "Invalid token format. It must be 'Bearer <token>'"}), 401

        if not token:
            return jsonify({"message": "Authentication token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = payload  # 요청 객체에 사용자 정보 추가
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated


# ============================
#   회원가입 API
# ============================
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"message": "missing fields"}), 400

    if role == "STUDENT":
        name = data.get("name")
        if not name:
            return jsonify({"message": "name is required for students"}), 400
    elif role == "BUSINESS":
        business_name = data.get("business_name")
        address = data.get("address")
        if not business_name or not address:
            return jsonify({"message": "business_name and address are required for businesses"}), 400
    else:
        return jsonify({"message": "invalid role"}), 400

    hashed_pw = generate_password_hash(password)

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        sql_user = """
        INSERT INTO users (email, password, role) VALUES (%s, %s, %s)
        RETURNING id
        """
        cursor.execute(sql_user, (email, hashed_pw, role))
        user_id = cursor.fetchone()['id']

        if role == "STUDENT":
            sql_student = """
            INSERT INTO students (user_id, name)
            VALUES (%s, %s)
            """
            cursor.execute(sql_student, (user_id, name))

        elif role == "BUSINESS":
            sql_business = """
            INSERT INTO businesses (user_id, business_name, address)
            VALUES (%s, %s, %s)
            """
            cursor.execute(sql_business, (user_id, business_name, address))

        conn.commit()
        return jsonify({"message": "success"}), 201

    except Exception as e:
        if conn:
            conn.rollback()
        # 이메일 중복 오류인지 확인
        if "violates unique constraint" in str(e):
            return jsonify({"message": "Email already exists"}), 409
        return jsonify({"message": "Registration failed due to an internal error"}), 500

    finally:
        if cursor:
            cursor.close()

# ============================
#   로그인 API
# ============================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "missing fields"}), 400

    try:
        conn = None
        cursor = None
        conn = get_db()
        cursor = conn.cursor() # psycopg2에서는 cursor_factory를 사용하므로 인자 없이 생성

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "email not found"}), 404

        if not check_password_hash(user["password"], password):
            return jsonify({"message": "wrong password"}), 401

        user_detail = {}

        if user["role"] == "STUDENT":
            cursor.execute("SELECT name FROM students WHERE user_id=%s", (user["id"],))
            stu = cursor.fetchone()
            if stu:
                user_detail["name"] = stu["name"]

        elif user["role"] == "BUSINESS":
            cursor.execute("SELECT business_name, address FROM businesses WHERE user_id=%s", (user["id"],))
            biz = cursor.fetchone()
            if biz:
                user_detail["business_name"] = biz["business_name"]
                user_detail["address"] = biz["address"]

        # JWT 토큰에 이름/상호명 포함
        payload = {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
        }

        # 역할별로 이름 또는 상호명 추가
        if user["role"] == "STUDENT" and "name" in user_detail:
            payload["name"] = user_detail["name"]
        elif user["role"] == "BUSINESS" and "business_name" in user_detail:
            payload["business_name"] = user_detail["business_name"]

        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "success",
            "token": token,
            "role": user["role"],
            "user_detail": user_detail
        }), 200

    except Exception as e:
        return jsonify({"message": "Login failed"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   비밀번호 변경 API
# ============================
@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    # 데코레이터에서 사용자 정보 주입
    user_id = request.user.get("id")

    # 요청 데이터 가져오기
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters"}), 400

    try:
        conn = None
        cursor = None
        conn = get_db()
        cursor = conn.cursor() # psycopg2에서는 cursor_factory를 사용하므로 인자 없이 생성

        # 현재 사용자 정보 조회
        cursor.execute("SELECT password FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # 현재 비밀번호 확인
        if not check_password_hash(user["password"], current_password):
            return jsonify({"message": "Current password is incorrect"}), 401

        # 새 비밀번호 해시화 및 업데이트
        hashed_new_pw = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password=%s WHERE id=%s", (hashed_new_pw, user_id))
        conn.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Password change failed"}), 500

    finally:
        if cursor:
            cursor.close()
