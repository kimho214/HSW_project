from datetime import datetime

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    if records is None:
        return [] if isinstance(records, list) else {}
    
    is_list = isinstance(records, list)
    if not is_list:
        records = [records] if records else []

    formatted_records = []
    for record in records:
        formatted_record = {}
        for key, value in record.items():
            if isinstance(value, datetime):
                formatted_record[key] = value.isoformat()
            elif value is None:
                formatted_record[key] = ""
            else:
                formatted_record[key] = value
        formatted_records.append(formatted_record)

    return formatted_records if is_list else formatted_records[0]
