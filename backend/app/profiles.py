from flask import Blueprint, request, jsonify
from app.db import get_db
from .auth import token_required # auth.py에서 데코레이터 가져오기
from .utils import format_records # 데이터 포맷팅 유틸리티 가져오기
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
@profiles_bp.route("/my", methods=["GET"])
@token_required
def get_my_profile():
    # 학생만 조회 가능
    if request.user.get("role") != "STUDENT":
        return jsonify({"message": "only students can view profiles"}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        sql = """
        SELECT
            s.*,
            u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = %s
        """
        cursor.execute(sql, (request.user["id"],))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"message": "profile not found"}), 404

        formatted_profile = format_records(profile)
        return jsonify({
            "message": "success",
            "profile": formatted_profile
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profile"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   프로필 등록/수정 API (학생만 가능)
# ============================
@profiles_bp.route("/my", methods=["PUT"])
@token_required
def update_my_profile():
    # 학생만 수정 가능
    if request.user.get("role") != "STUDENT":
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

        params.append(request.user["id"])
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


# ============================
#   공개 프로필 목록 조회 API (누구나 가능)
# ============================
@profiles_bp.route("", methods=["GET"])
def get_public_profiles():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

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
        WHERE s.is_profile_public IS TRUE
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

        formatted_profiles = format_records(profiles)
        return jsonify({
            "message": "success",
            "count": len(formatted_profiles),
            "profiles": formatted_profiles
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profiles"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   특정 프로필 조회 API (누구나 가능)
# ============================
@profiles_bp.route("/<int:user_id>", methods=["GET"])
def get_profile_by_id(user_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

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
        AND s.is_profile_public IS TRUE
        """

        cursor.execute(sql, (user_id,))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"message": "profile not found"}), 404

        formatted_profile = format_records(profile)
        return jsonify({
            "message": "success",
            "profile": formatted_profile
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch profile"}), 500

    finally:
        if cursor:
            cursor.close()
