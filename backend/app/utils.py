from datetime import datetime

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    if records is None:
        return None

    is_list = isinstance(records, list)
    if not is_list:
        records = [records]

    formatted_records = []
    for record in records:
        formatted_record = {}
        # dict() 변환을 통해 psycopg2 DictRow를 일반 dict로 변환
        record_dict = dict(record) if hasattr(record, 'items') else record
        for key, value in record_dict.items():
            if isinstance(value, datetime):
                formatted_record[key] = value.isoformat()
            elif value is None:
                formatted_record[key] = ""
            else:
                formatted_record[key] = value
        formatted_records.append(formatted_record)

    return formatted_records if is_list else formatted_records[0]
