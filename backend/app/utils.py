from datetime import datetime
from collections.abc import Mapping # Import Mapping for dictionary-like objects

def _format_single_record(record):
    """Helper function to format a single dictionary-like record."""
    if not isinstance(record, Mapping):
        return record # Return as is if not a mappable object

    formatted_record = {}
    for key, value in record.items():
        if isinstance(value, datetime):
            formatted_record[key] = value.isoformat()
        elif value is None:
            formatted_record[key] = "" # As requested, convert None to empty string
        else:
            formatted_record[key] = value
    return formatted_record

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    if isinstance(records, list):
        return [_format_single_record(r) for r in records]
    elif records is not None:
        return _format_single_record(records)
    else: # Handles case where a single record is None
        return {} # Return an empty object for a non-existent single record
