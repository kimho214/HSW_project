"""
students 테이블에 프로필 필드 추가 스크립트

사용법:
    python setup_student_profile.py
"""

from app.db import get_db

def update_students_table():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # MySQL 5.7 호환을 위해 각 컬럼 존재 여부를 개별 확인한 뒤 추가
        columns = {
            "introduction": "TEXT",
            "skills": "TEXT",
            "portfolio_url": "VARCHAR(500)",
            "github_url": "VARCHAR(500)",
            "linkedin_url": "VARCHAR(500)",
            "is_profile_public": "BOOLEAN DEFAULT TRUE",
            "updated_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        }

        for col, definition in columns.items():
            cursor.execute("SHOW COLUMNS FROM students LIKE %s", (col,))
            if cursor.fetchone():
                continue
            cursor.execute(f"ALTER TABLE students ADD COLUMN {col} {definition}")

        conn.commit()

        print("✅ students 테이블에 프로필 필드가 성공적으로 추가되었습니다!")

    except Exception as e:
        print(f"❌ 테이블 업데이트 실패: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    update_students_table()
