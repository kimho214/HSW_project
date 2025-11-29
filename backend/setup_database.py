"""
데이터베이스 테이블 생성 스크립트
이 스크립트를 실행하면 projects 테이블이 생성됩니다.

사용법:
    python setup_database.py
"""

from app.db import get_db

def create_projects_table():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 프로젝트 테이블 생성
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            business_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            location VARCHAR(255),
            salary VARCHAR(100),
            duration VARCHAR(100),
            required_skills TEXT,
            status ENUM('OPEN', 'CLOSED', 'IN_PROGRESS') DEFAULT 'OPEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """

        cursor.execute(create_table_sql)
        conn.commit()

        print("✅ projects 테이블이 성공적으로 생성되었습니다!")

    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    create_projects_table()
