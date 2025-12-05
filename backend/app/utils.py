from datetime import datetime
from collections.abc import Mapping # Import Mapping for dictionary-like objects

def _format_single_record(record):
    """Helper function to format a single dictionary-like record."""
    if not isinstance(record, Mapping):
        # If it's not a dictionary-like object (e.g., int, str), return it as is.
        # This handles cases where a column might contain a simple type directly.
        return record

    formatted_record = {}
    for key, value in record.items():
        if isinstance(value, datetime):
            formatted_record[key] = value.isoformat()
        elif value is None:
            formatted_record[key] = "" # 사용자 요청에 따라 None을 빈 문자열로 변환
        else:
            formatted_record[key] = value
    return formatted_record

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    if records is None:
        return {} # 단일 레코드 조회 시 결과가 없을 경우 빈 객체 반환
    if isinstance(records, list):
        return [_format_single_record(record) for record in records]
    else:
        return _format_single_record(records)
