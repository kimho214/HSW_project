from flask import Blueprint, request, jsonify
from app.db import get_db
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

profiles_bp = Blueprint("profiles", __name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")


# ============================
#   내 프로필 조회 API (학생만 가능)
# ============================
@profiles_bp.route("/my", methods=["GET", "OPTIONS"])
def get_my_profile():
    # OPTIONS 요청 처리
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        # PUT 프리플라이트도 통과시키기 위해 PUT 포함
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS')
        return response, 200

    # 토큰 검증
    token = None
    auth_header = request.headers.get('Authorization')

    if auth_header:
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "invalid token format"}), 401

    if not token:
        return jsonify({"message": "token is missing"}), 401

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "invalid token"}), 401

    # 학생만 조회 가능
    if payload.get("role") != "STUDENT":
        return jsonify({"message": "only students can view profiles"}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        sql = """
        SELECT
            s.*,
            u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = %s
        """
        cursor.execute(sql, (payload["id"],))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"message": "profile not found"}), 404

        return jsonify({
            "message": "success",
            "profile": profile
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profile"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   프로필 등록/수정 API (학생만 가능)
# ============================
@profiles_bp.route("/my", methods=["PUT", "OPTIONS"])
def update_my_profile():
    # OPTIONS 요청 처리
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'PUT,GET,OPTIONS')
        return response, 200

    # 토큰 검증
    token = None
    auth_header = request.headers.get('Authorization')

    if auth_header:
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "invalid token format"}), 401

    if not token:
        return jsonify({"message": "token is missing"}), 401

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "invalid token"}), 401

    # 학생만 수정 가능
    if payload.get("role") != "STUDENT":
        return jsonify({"message": "only students can update profiles"}), 403

    data = request.get_json()

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 업데이트할 필드만 선택적으로 수정
        ALLOWED_FIELDS = ["introduction", "skills", "portfolio_url", "github_url", "linkedin_url", "is_profile_public"]
        update_fields = []
        params = []

        for field in ALLOWED_FIELDS:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])

        if not update_fields:
            return jsonify({"message": "no fields to update"}), 400

        params.append(payload["id"])
        sql = f"UPDATE students SET {', '.join(update_fields)} WHERE user_id = %s"

        cursor.execute(sql, params)
        conn.commit()

        return jsonify({"message": "profile updated successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to update profile"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   공개 프로필 목록 조회 API (누구나 가능)
# ============================
@profiles_bp.route("", methods=["GET"])
def get_public_profiles():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 쿼리 파라미터로 필터링
        skill = request.args.get("skill")

        # 공개 프로필만 조회
        sql = """
        SELECT
            s.user_id as id,
            s.name as username,
            s.introduction,
            s.skills,
            s.portfolio_url,
            s.github_url,
            s.linkedin_url,
            u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_profile_public = TRUE
        AND s.introduction IS NOT NULL
        """
        params = []

        # 스킬 필터 추가
        if skill:
            sql += " AND s.skills LIKE %s"
            params.append(f"%{skill}%")

        sql += " ORDER BY s.user_id DESC"

        cursor.execute(sql, params)
        profiles = cursor.fetchall()

        return jsonify({
            "message": "success",
            "count": len(profiles),
            "profiles": profiles
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profiles"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   특정 프로필 조회 API (누구나 가능)
# ============================
@profiles_bp.route("/<int:user_id>", methods=["GET"])
def get_profile_by_id(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        sql = """
        SELECT
            s.user_id as id,
            s.name as username,
            s.introduction,
            s.skills,
            s.portfolio_url,
            s.github_url,
            s.linkedin_url,
            u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = %s
        AND s.is_profile_public = TRUE
        """

        cursor.execute(sql, (user_id,))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"message": "profile not found"}), 404

        return jsonify({
            "message": "success",
            "profile": profile
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profile"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
