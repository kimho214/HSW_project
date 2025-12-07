#!/usr/bin/env python3
"""
Render PostgreSQL 데이터베이스 초기화 스크립트
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """데이터베이스 테이블 생성"""

    # DATABASE_URL 환경 변수에서 연결 정보 가져오기
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.")
        print("Render Dashboard에서 DATABASE_URL을 복사하여 .env 파일에 추가하세요.")
        return

    try:
        # PostgreSQL 연결
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print("✅ 데이터베이스 연결 성공")

        # schema.sql 파일 읽기
        with open('schema.sql', 'r', encoding='utf-8') as f:
            schema = f.read()

        # SQL 실행
        cursor.execute(schema)
        conn.commit()

        print("✅ 테이블 생성 완료")

        # 테이블 목록 확인
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print(f"\n📊 생성된 테이블 ({len(tables)}개):")
        for table in tables:
            print(f"  - {table[0]}")

        cursor.close()
        conn.close()

        print("\n✅ 데이터베이스 초기화 완료!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    init_database()
