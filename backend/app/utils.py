from datetime import datetime
from collections.abc import Mapping # Import Mapping for dictionary-like objects


def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    def _format_single(record):
        if not isinstance(record, Mapping): # DictRow는 Mapping의 인스턴스입니다.
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
