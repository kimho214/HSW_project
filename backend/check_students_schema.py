"""
students 테이블의 스키마를 확인하여 update_students_profile.sql이 실행되었는지 체크
"""
from app.db import get_db

def check_students_schema():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # students 테이블의 모든 컬럼 정보 조회
        sql = """
        DESCRIBE students
        """
        cursor.execute(sql)
        columns = cursor.fetchall()

        print("=== students 테이블 스키마 ===\n")

        # 확인해야 할 컬럼들
        required_columns = [
            'introduction',
            'skills',
            'portfolio_url',
            'github_url',
            'linkedin_url',
            'is_profile_public',
            'updated_at'
        ]

        existing_column_names = [col['Field'] for col in columns]

        print("전체 컬럼 목록:")
        for col in columns:
            print(f"  - {col['Field']} ({col['Type']}) {'NULL' if col['Null'] == 'YES' else 'NOT NULL'}")

        print("\n=== update_students_profile.sql 실행 여부 확인 ===\n")

        missing_columns = []
        for req_col in required_columns:
            if req_col in existing_column_names:
                print(f"✅ {req_col} - 존재함")
            else:
                print(f"❌ {req_col} - 존재하지 않음")
                missing_columns.append(req_col)

        print("\n=== 결론 ===")
        if len(missing_columns) == 0:
            print("✅ update_students_profile.sql이 이미 실행되었습니다.")
            print("   모든 필수 컬럼이 존재합니다.")
        else:
            print("❌ update_students_profile.sql이 실행되지 않았습니다.")
            print(f"   누락된 컬럼: {', '.join(missing_columns)}")
            print("\n실행 방법:")
            print("  mysql -u root -p talent_platform < update_students_profile.sql")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    check_students_schema()
