"""
하이픈(-)으로 생성된 채팅방을 언더스코어(_)로 통합하는 마이그레이션 스크립트
"""
from app.db import get_db

def migrate_room_ids():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 하이픈이 포함된 room_id 찾기
        sql = """
        SELECT DISTINCT room_id
        FROM messages
        WHERE room_id LIKE '%-%'
        """
        cursor.execute(sql)
        hyphen_rooms = cursor.fetchall()

        if not hyphen_rooms:
            print("하이픈으로 된 채팅방이 없습니다.")
            return

        print(f"총 {len(hyphen_rooms)}개의 하이픈 채팅방을 찾았습니다.\n")

        for room in hyphen_rooms:
            old_room_id = room['room_id']
            new_room_id = old_room_id.replace('-', '_')

            print(f"변환: {old_room_id} -> {new_room_id}")

            # 새로운 room_id로 메시지가 이미 존재하는지 확인
            cursor.execute(
                "SELECT COUNT(*) as count FROM messages WHERE room_id = %s",
                (new_room_id,)
            )
            existing_count = cursor.fetchone()['count']

            if existing_count > 0:
                print(f"  ⚠️  새로운 room_id에 이미 {existing_count}개의 메시지가 있습니다.")
                print(f"  → 기존 메시지를 새 채팅방으로 병합합니다.")

            # room_id 업데이트
            update_sql = """
            UPDATE messages
            SET room_id = %s
            WHERE room_id = %s
            """
            cursor.execute(update_sql, (new_room_id, old_room_id))
            updated_count = cursor.rowcount

            print(f"  ✅ {updated_count}개의 메시지를 업데이트했습니다.\n")

        conn.commit()
        print("✅ 모든 채팅방 통합이 완료되었습니다!")

        # 결과 확인
        print("\n=== 통합 후 채팅방 목록 ===")
        cursor.execute("""
            SELECT room_id, COUNT(*) as message_count
            FROM messages
            GROUP BY room_id
            ORDER BY room_id
        """)
        rooms = cursor.fetchall()

        for room in rooms:
            print(f"Room: {room['room_id']} - {room['message_count']}개 메시지")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=== 채팅방 마이그레이션 시작 ===\n")
    migrate_room_ids()
