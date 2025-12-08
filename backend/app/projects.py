from flask import Blueprint, request, jsonify
from app.db import get_db
import os
from .auth import token_required # auth.py에서 데코레이터 가져오기
from .utils import format_records # 데이터 포맷팅 유틸리티 가져오기
from psycopg2.extras import DictCursor
import traceback # traceback 모듈 임포트
from dotenv import load_dotenv

load_dotenv()

projects_bp = Blueprint("projects", __name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")



# ============================
#   프로젝트 등록 API (사장님만 가능)
# ============================
@projects_bp.route("", methods=["POST"])
@token_required
def create_project():
    # 사장님만 프로젝트 등록 가능
    if request.user.get("role") != "BUSINESS":
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
            request.user["id"],
            title,
            description,
            location,
            salary,
            duration,
            required_skills
        ))

        conn.commit()
        project_id = cursor.fetchone()[0] # DictRow가 아닌 경우를 대비해 인덱스로 접근

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
        LEFT JOIN users u ON p.business_id = u.id
        LEFT JOIN businesses b ON u.id = b.user_id
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

        # 모든 레코드의 None 값을 빈 문자열로, datetime을 문자열로 변환
        formatted_projects = format_records(projects)

        return jsonify({
            "message": "success",
            "count": len(formatted_projects),
            "projects": formatted_projects
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
@token_required
def get_my_projects():
    # 사장님만 조회 가능
    if request.user.get("role") != "BUSINESS":
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
        GROUP BY p.id, b.business_name, b.address
        """
        cursor.execute(sql, (request.user["id"],))
        projects = cursor.fetchall()

        # 모든 레코드의 None 값을 빈 문자열로, datetime을 문자열로 변환
        formatted_projects = format_records(projects)

        return jsonify({
            "message": "success",
            "count": len(formatted_projects),
            "projects": formatted_projects
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
        cursor = conn.cursor(cursor_factory=DictCursor) # 결과를 딕셔너리 형태로 받기 위해 DictCursor를 사용합니다.

        sql = """
        SELECT
            p.*,
            b.business_name,
            b.address as business_address,
            u.email as business_email
        FROM projects p
        LEFT JOIN users u ON p.business_id = u.id
        LEFT JOIN businesses b ON u.id = b.user_id
        WHERE p.id = %s
        """
        cursor.execute(sql, (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "project not found"}), 404

        formatted_project = format_records(project)

        return jsonify({
            "message": "success",
            "project": formatted_project
        }), 200

    except Exception as e:
        # 에러 발생 시 서버 로그에 상세 내용을 출력하여 디버깅을 돕습니다.
        print(f"Error in get_project_detail for project_id {project_id}:")
        traceback.print_exc()
        return jsonify({"message": "Failed to fetch project details"}), 500
    
    finally:
        if cursor:
            cursor.close()


# ============================
#   프로젝트 수정 API (작성자만 가능)
# ============================
@projects_bp.route("/<int:project_id>", methods=["PUT"])
@token_required
def update_project(project_id):
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

        if project["business_id"] != request.user["id"]:
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
@token_required
def delete_project(project_id):
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

        if project["business_id"] != request.user["id"]:
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
