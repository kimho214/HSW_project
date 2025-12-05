from datetime import datetime
from collections.abc import Mapping # Import Mapping for dictionary-like objects
from contextlib import contextmanager
from app.db import get_db
from flask import jsonify


def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    def _format_single(record):
        if not isinstance(record, Mapping):
            return record
        formatted = {}
        for key, value in record.items():
            if isinstance(value, datetime):
                formatted[key] = value.isoformat()
            elif value is None:
                formatted[key] = ""  # None을 빈 문자열로 변환
            else:
                formatted[key] = value
        return formatted

    if isinstance(records, list):
        return [_format_single(r) for r in records]
    elif records is None:
        return {}  # 단일 레코드가 None일 경우 빈 객체 반환
    else:
        return _format_single(records)

@contextmanager
def db_transaction():
    """
    데이터베이스 트랜잭션과 커서 관리를 위한 컨텍스트 매니저.
    성공 시 커밋, 예외 발생 시 롤백을 자동으로 처리합니다.
    """
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        # 특정 예외에 대한 처리를 위해 예외를 다시 발생시킬 수 있습니다.
        # 또는 여기서 바로 에러 응답을 생성할 수도 있습니다.
        # 여기서는 호출한 쪽에서 처리하도록 예외를 다시 발생시킵니다.
        raise e
    finally:
        if cursor:
            cursor.close()

def api_error_handler(e, default_message="An internal error occurred", status_code=500):
    """API 에러 발생 시 표준화된 JSON 응답을 생성합니다."""
    print(f"API Error: {e}") # 에러 로깅
    return jsonify({"message": default_message, "error": str(e)}), status_code
