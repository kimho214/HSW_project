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

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not username or not email or not password or not role:
        return jsonify({"message": "missing fields"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = get_db()
        cursor = conn.cursor()

        sql = """
        INSERT INTO users (username, email, password, role)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (username, email, hashed_pw, role))
        conn.commit()

        return jsonify({"message": "success"}), 201

    except Exception as e:
        return jsonify({"message": "error", "detail": str(e)}), 400



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
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 이메일로 유저 찾기
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "email not found"}), 404

        # 비밀번호 검증
        if not check_password_hash(user["password"], password):
            return jsonify({"message": "wrong password"}), 401

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
            "role": user["role"]
        }), 200

    except Exception as e:
        return jsonify({"message": "error", "detail": str(e)}), 500
