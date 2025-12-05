import os
from dotenv import load_dotenv
import psycopg2
from flask import g
from psycopg2.extras import DictCursor

load_dotenv()  # .env 파일 불러오기

def get_db():
    """
    애플리케이션 컨텍스트(g)를 사용하여 현재 요청에 대한 데이터베이스 연결을 가져옵니다.
    연결이 없으면 새로 생성하고, 있으면 기존 연결을 반환합니다.
    """
    if 'db' not in g:
        # Render에서 제공하는 DATABASE_URL 환경 변수를 사용합니다.
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL must be set in environment variables for PostgreSQL")
        # 연결과 커서를 함께 컨텍스트에 저장
        conn = psycopg2.connect(database_url)
        g.db = conn
        g.cursor = conn.cursor(cursor_factory=DictCursor)
    return g.db, g.cursor

def close_db(e=None):
    """
    요청이 끝날 때 데이터베이스 연결을 닫습니다.
    """
    db = g.pop('db', None)
    if db is not None:
        # 커서도 함께 닫아줍니다.
        cursor = g.pop('cursor', None)
        if cursor is not None:
            cursor.close()
        db.close()
