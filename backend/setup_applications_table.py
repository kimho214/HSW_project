"""
지원(applications) 테이블 생성 스크립트

사용법:
    python setup_applications_table.py
"""

from app.db import get_db

def create_applications_table():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 지원 테이블 생성
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            student_id INT NOT NULL,
            cover_letter TEXT,
            status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_application (project_id, student_id)
        )
        """

        cursor.execute(create_table_sql)
        conn.commit()

        print("✅ applications 테이블이 성공적으로 생성되었습니다!")

    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_applications_table()
