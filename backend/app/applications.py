from flask import Blueprint, request, jsonify
from app.db import get_db
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

applications_bp = Blueprint("applications", __name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")


# ============================
#   프로젝트에 지원하기 API (학생만 가능)
# ============================
@applications_bp.route("", methods=["POST"])
def create_application():
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

    # 학생만 지원 가능
    if payload.get("role") != "STUDENT":
        return jsonify({"message": "only students can apply to projects"}), 403

    data = request.get_json()
    project_id = data.get("project_id")
    cover_letter = data.get("cover_letter", "")

    if not project_id:
        return jsonify({"message": "project_id is required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 프로젝트 존재 여부 확인
        cursor.execute("SELECT id FROM projects WHERE id = %s AND status = 'OPEN'", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found or not open"}), 404

        # 지원 등록
        sql = """
        INSERT INTO applications (project_id, student_id, cover_letter)
        VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (project_id, payload["id"], cover_letter))
        conn.commit()
        application_id = cursor.lastrowid

        return jsonify({
            "message": "application submitted successfully",
            "application_id": application_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        # 중복 지원 체크
        if "unique_application" in str(e).lower() or "duplicate" in str(e).lower():
            return jsonify({"message": "You have already applied to this project"}), 409
        return jsonify({"message": "Failed to submit application"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   특정 프로젝트의 지원자 목록 조회 (프로젝트 작성자만 가능)
# ============================
@applications_bp.route("/project/<int:project_id>", methods=["GET"])
def get_project_applications(project_id):
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

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 프로젝트 소유자 확인
        cursor.execute("SELECT business_id FROM projects WHERE id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found"}), 404

        if project["business_id"] != payload["id"]:
            return jsonify({"message": "unauthorized"}), 403

        # 지원자 목록 조회
        sql = """
        SELECT
            a.*,
            s.name as student_name,
            u.email as student_email
        FROM applications a
        JOIN users u ON a.student_id = u.id
        JOIN students s ON u.id = s.user_id
        WHERE a.project_id = %s
        ORDER BY a.created_at DESC
        """
        cursor.execute(sql, (project_id,))
        applications = cursor.fetchall()

        # 날짜 형식 변환 (JSON 직렬화 오류 방지)
        for app in applications:
            if 'created_at' in app and hasattr(app['created_at'], 'isoformat'):
                app['created_at'] = app['created_at'].isoformat()

        return jsonify({
            "message": "success",
            "count": len(applications),
            "applications": applications
        }), 200

    except Exception as e:
        print(f"Error fetching my applications: {e}") # 디버깅을 위한 로그 추가
        return jsonify({"message": "Failed to fetch applications"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   내가 지원한 프로젝트 목록 조회 (학생만 가능)
# ============================
@applications_bp.route("/my", methods=["GET"])
def get_my_applications():
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
        return jsonify({"message": "only students can view their applications"}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 내가 지원한 프로젝트 목록
        sql = """
        SELECT
            a.*,
            p.title as project_title,
            p.description as project_description,
            p.salary,
            p.location,
            b.business_name,
            u.email as business_id
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        LEFT JOIN users u ON p.business_id = u.id
        LEFT JOIN businesses b ON u.id = b.user_id
        WHERE a.student_id = %s
        ORDER BY a.created_at DESC
        """
        cursor.execute(sql, (payload["id"],))
        applications = cursor.fetchall()

        # 날짜 형식 변환 (JSON 직렬화 오류 방지)
        for app in applications:
            if 'created_at' in app and hasattr(app['created_at'], 'isoformat'):
                app['created_at'] = app['created_at'].isoformat()

        return jsonify({
            "message": "success",
            "count": len(applications),
            "applications": applications
        }), 200

    except Exception as e:
        print(f"Error fetching my applications: {e}") # 디버깅을 위한 로그 추가
        return jsonify({"message": "Failed to fetch applications"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ============================
#   지원 상태 변경 API (프로젝트 작성자만 가능)
# ============================
@applications_bp.route("/<int:application_id>", methods=["PUT"])
def update_application_status(application_id):
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

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["PENDING", "ACCEPTED", "REJECTED"]:
        return jsonify({"message": "invalid status"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 지원 정보 및 프로젝트 소유자 확인
        sql = """
        SELECT a.*, p.business_id
        FROM applications a
        JOIN projects p ON a.project_id = p.id
        WHERE a.id = %s
        """
        cursor.execute(sql, (application_id,))
        application = cursor.fetchone()

        if not application:
            return jsonify({"message": "application not found"}), 404

        if application["business_id"] != payload["id"]:
            return jsonify({"message": "unauthorized"}), 403

        # 상태 업데이트
        cursor.execute(
            "UPDATE applications SET status = %s WHERE id = %s",
            (new_status, application_id)
        )
        conn.commit()

        return jsonify({"message": "application status updated successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to update application status"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
