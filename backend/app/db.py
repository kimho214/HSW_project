import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()  # .env 파일 불러오기

def get_db():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "1234"),
        database=os.getenv("DB_NAME", "talent_match"),
        port=int(os.getenv("DB_PORT", "3306")),
        autocommit=True # 🔴 중요: 모든 쿼리가 즉시 커밋되도록 설정합니다.
    )
    return conn
