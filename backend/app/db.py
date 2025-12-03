import os
from dotenv import load_dotenv
import mysql.connector
from flask import g

load_dotenv()  # .env 파일 불러오기

def get_db():
    """
    애플리케이션 컨텍스트(g)를 사용하여 현재 요청에 대한 데이터베이스 연결을 가져옵니다.
    연결이 없으면 새로 생성하고, 있으면 기존 연결을 반환합니다.
    """
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "talent_match"),
            port=int(os.getenv("DB_PORT", 3306)),
            connection_timeout=10  # 10초 이상 응답이 없으면 연결 실패 처리
        )
    return g.db

def close_db(e=None):
    """
    요청이 끝날 때 데이터베이스 연결을 닫습니다.
    """
    db = g.pop('db', None)
    if db is not None:
        db.close()
