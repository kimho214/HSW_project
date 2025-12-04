from flask import Blueprint, request, jsonify
from app.db import get_db
import jwt
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

projects_bp = Blueprint("projects", __name__)

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

        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # "Bearer <token>"
            except IndexError:
                return jsonify({"message": "invalid token format"}), 401

        if not token:
            return jsonify({"message": "token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = payload  # 요청 객체에 사용자 정보 추가
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "invalid token"}), 401

        return f(*args, **kwargs)

    return decorated


# ============================
#   프로젝트 등록 API (사장님만 가능)
# ============================
@projects_bp.route("", methods=["POST"])
def create_project():
    # POST 요청은 토큰 검증
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

    # 사장님만 프로젝트 등록 가능
    if payload.get("role") != "BUSINESS":
        return jsonify({"message": "only business users can create projects"}), 403

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    location = data.get("location")
    salary = data.get("salary")
    duration = data.get("duration")
    required_skills = data.get("required_skills")  # 쉼표로 구분된 문자열

    if not title or not description:
        return jsonify({"message": "title and description are required"}), 400

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        sql = """
        INSERT INTO projects (business_id, title, description, location, salary, duration, required_skills)
        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """
        cursor.execute(sql, (
            payload["id"],
            title,
            description,
            location,
            salary,
            duration,
            required_skills
        ))

        conn.commit()
        project_id = cursor.fetchone()['id']

        return jsonify({
            "message": "project created successfully",
            "project_id": project_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to create project"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   프로젝트 목록 조회 API (누구나 가능)
# ============================
@projects_bp.route("", methods=["GET"])
def get_projects():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 쿼리 파라미터로 필터링 (선택사항)
        status = request.args.get("status", "OPEN")  # 기본값: OPEN
        location = request.args.get("location")

        # 기본 쿼리
        sql = """
        SELECT
            p.*,
            b.business_name,
            b.address as business_address
        FROM projects p
        JOIN users u ON p.business_id = u.id
        JOIN businesses b ON u.id = b.user_id
        WHERE p.status = %s
        """
        params = [status]

        # 지역 필터 추가
        if location:
            sql += " AND p.location LIKE %s"
            params.append(f"%{location}%")

        sql += " ORDER BY p.created_at DESC"

        cursor.execute(sql, params)
        projects = cursor.fetchall()

        # 날짜 필드를 JSON으로 직렬화 가능한 문자열로 변환
        for project in projects:
            if 'created_at' in project and hasattr(project['created_at'], 'isoformat'):
                project['created_at'] = project['created_at'].isoformat()
            if 'updated_at' in project and hasattr(project['updated_at'], 'isoformat'):
                project['updated_at'] = project['updated_at'].isoformat()

        return jsonify({
            "message": "success",
            "count": len(projects),
            "projects": projects
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch projects"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   내 프로젝트 목록 조회 API (사장님만 가능)
# ============================
@projects_bp.route("/my", methods=["GET"])
def get_my_projects():
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

    # 사장님만 조회 가능
    if payload.get("role") != "BUSINESS":
        return jsonify({"message": "only business users can view their projects"}), 403

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 내가 등록한 프로젝트 목록
        sql = """
        SELECT
            p.*,
            b.business_name,
            b.address as business_address,
            COUNT(a.id) as application_count
        FROM projects p
        JOIN users u ON p.business_id = u.id
        JOIN businesses b ON u.id = b.user_id
        LEFT JOIN applications a ON p.id = a.project_id
        WHERE p.business_id = %s
        GROUP BY p.id
        ORDER BY p.created_at DESC
        """
        cursor.execute(sql, (payload["id"],))
        projects = cursor.fetchall()

        return jsonify({
            "message": "success",
            "count": len(projects),
            "projects": projects
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch projects"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   프로젝트 상세 조회 API
# ============================
@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project_detail(project_id):
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        sql = """
        SELECT
            p.*,
            b.business_name,
            b.address as business_address,
            u.email as business_email
        FROM projects p
        JOIN users u ON p.business_id = u.id
        JOIN businesses b ON u.id = b.user_id
        WHERE p.id = %s
        """

        cursor.execute(sql, (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found"}), 404

        return jsonify({
            "message": "success",
            "project": project
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch project details"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   프로젝트 수정 API (작성자만 가능)
# ============================
@projects_bp.route("/<int:project_id>", methods=["PUT"])
def update_project(project_id):
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
        cursor = conn.cursor()

        # 프로젝트 소유자 확인
        cursor.execute("SELECT business_id FROM projects WHERE id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found"}), 404

        if project["business_id"] != payload["id"]:
            return jsonify({"message": "unauthorized"}), 403

        data = request.get_json()

        # 업데이트할 필드만 선택적으로 수정 (SQL Injection 방지)
        ALLOWED_FIELDS = ["title", "description", "location", "salary", "duration", "required_skills", "status"]
        update_fields = []
        params = []

        for field in ALLOWED_FIELDS:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])

        if not update_fields:
            return jsonify({"message": "no fields to update"}), 400

        params.append(project_id)
        sql = f"UPDATE projects SET {', '.join(update_fields)} WHERE id = %s"

        cursor.execute(sql, params)
        conn.commit()

        return jsonify({"message": "project updated successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to update project"}), 500

    finally:
        if cursor:
            cursor.close()


# ============================
#   프로젝트 삭제 API (작성자만 가능)
# ============================
@projects_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
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
        cursor = conn.cursor()

        # 프로젝트 소유자 확인
        cursor.execute("SELECT business_id FROM projects WHERE id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found"}), 404

        if project["business_id"] != payload["id"]:
            return jsonify({"message": "unauthorized"}), 403

        cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        conn.commit()

        return jsonify({"message": "project deleted successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to delete project"}), 500

    finally:
        if cursor:
            cursor.close()
