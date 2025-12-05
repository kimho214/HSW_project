from datetime import datetime

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값은 그대로 유지하여 JSON에서 null로 변환되도록 합니다.
    """
    if records is None:
        # 입력이 None이면 None을 반환 (호출하는 쪽에서 처리)
        return None

    def format_single_record(record):
        """단일 레코드를 포맷하는 내부 함수"""
        formatted = {}
        for key, value in record.items():
            if isinstance(value, datetime):
                formatted[key] = value.isoformat()
            # None 값은 변환하지 않고 그대로 둠
            elif value is None:
                formatted[key] = None
            else:
                formatted[key] = value
        return formatted

    if isinstance(records, list):
        return [format_single_record(r) for r in records]
    else: # 단일 객체인 경우
        return format_single_record(records)
