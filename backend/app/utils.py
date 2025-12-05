from datetime import datetime
from collections.abc import Mapping # Import Mapping for dictionary-like objects

def format_records(records):
    """
    DB에서 조회된 단일 레코드 또는 레코드 리스트를 API 응답에 맞게 포맷합니다.
    - datetime 객체를 ISO 8601 형식의 문자열로 변환합니다.
    - None 값을 빈 문자열("")로 변환합니다.
    """
    if records is None:
        return [] if isinstance(records, list) else {}
    
    is_list = isinstance(records, list)
    
    # 단일 레코드인 경우 리스트로 감싸서 일관되게 처리 (또는 직접 처리)
    if not is_list:
        records = [records] # Wrap single record in a list for consistent iteration

    formatted_records = []
    for record in records: # Iterate over the (potentially wrapped) list
        # record가 딕셔너리 형태 (DictRow 포함)일 때만 포맷팅 수행
        if isinstance(record, Mapping): # Use collections.abc.Mapping for dict-like objects
            formatted_record = {}
            for key, value in record.items():
                if isinstance(value, datetime):
                    formatted_record[key] = value.isoformat()
                elif value is None:
                    formatted_record[key] = "" # 사용자 요청에 따라 None을 빈 문자열로 변환
                else:
                    formatted_record[key] = value
            formatted_records.append(formatted_record)
        # 딕셔너리 형태가 아니면 (예: int, str, tuple) 원본 값 그대로 추가
        else:
            # 딕셔너리가 아니면 (예: int, str) 원본 값 그대로 추가
            formatted_records.append(record)

    return formatted_records if is_list else (formatted_records[0] if formatted_records else None)
