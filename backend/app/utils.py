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
        # If it's not a list, it should be a dictionary-like object (DictRow).
        # If it's not a dict, it's an unexpected type for formatting.
        if not isinstance(records, dict):
            # Log the unexpected type for debugging
            print(f"DEBUG: format_records received unexpected non-dict, non-list type: {type(records)}, value: {records}")
            return records # Return as is, or raise a more specific error, to prevent crash
        records = [records] # Wrap single dict-like object in a list for uniform processing

    formatted_records = []
    for record in records:
        if isinstance(record, dict): # Ensure 'record' is a dict-like object before calling .items()
            formatted_record = {}
            for key, value in record.items():
                if isinstance(value, datetime):
                    formatted_record[key] = value.isoformat()
                elif value is None:
                    formatted_record[key] = ""
                else:
                    formatted_record[key] = value
            formatted_records.append(formatted_record)
        else:
            # If an item in the list is not a dict, it's unexpected.
            # For now, just append it as is, or handle as an error.
            print(f"DEBUG: format_records found non-dict item in list: {type(record)}, value: {record}")
            formatted_records.append(record)

    return formatted_records if is_list else formatted_records[0]
