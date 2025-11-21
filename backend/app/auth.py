from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_db
import jwt
import datetime

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = "mysecretkey"  # 나중에 .env로 이동 가능


# ============================
#   회원가입 API
# ============================
@auth_bp.route("/signup", methods=["POST", "OPTIONS"])
def signup():

    # 🔥 OPTIONS 프리플라이트 요청 처리 (맥북 필요)
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    
    # 디버깅 출력
    print("=" * 50)
    print("받은 데이터:", data)
    print("=" * 50)

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

    try:
        conn = get_db()
        cursor = conn.cursor()

        sql_user = """
        INSERT INTO users (email, password, role)
        VALUES (%s, %s, %s)
        """
        cursor.execute(sql_user, (email, hashed_pw, role))
        user_id = cursor.lastrowid

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
        return jsonify({"message": "error", "detail": str(e)}), 400

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



# ============================
#   로그인 API
# ============================
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():

    # 🔥 OPTIONS 처리 (로그인도 필요)
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "missing fields"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

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
