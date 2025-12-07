"""
채팅 메시지 테이블을 확인하여 중복된 채팅방을 찾는 스크립트
"""
from app.db import get_db

def check_messages():
    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 모든 메시지 조회
        sql = """
        SELECT DISTINCT room_id
        FROM messages
        ORDER BY room_id
        """
        cursor.execute(sql)
        rooms = cursor.fetchall()

        print("=== 모든 채팅방 목록 ===")
        for room in rooms:
            room_id = room['room_id']
            print(f"\nRoom ID: {room_id}")

            # 각 채팅방의 메시지 수 확인
            cursor.execute(
                "SELECT COUNT(*) as count FROM messages WHERE room_id = %s",
                (room_id,)
            )
            count = cursor.fetchone()['count']
            print(f"메시지 수: {count}")

            # 각 채팅방의 참여자 확인
            cursor.execute(
                "SELECT DISTINCT sender FROM messages WHERE room_id = %s",
                (room_id,)
            )
            senders = cursor.fetchall()
            print(f"참여자: {[s['sender'] for s in senders]}")

        # 같은 사용자 간에 여러 채팅방이 있는지 확인
        print("\n\n=== 중복 채팅방 분석 ===")
        room_participants = {}
        for room in rooms:
            room_id = room['room_id']
            cursor.execute(
                "SELECT DISTINCT sender FROM messages WHERE room_id = %s ORDER BY sender",
                (room_id,)
            )
            senders = cursor.fetchall()
            participants = tuple(sorted([s['sender'] for s in senders]))

            if participants not in room_participants:
                room_participants[participants] = []
            room_participants[participants].append(room_id)

        for participants, room_ids in room_participants.items():
            if len(room_ids) > 1:
                print(f"\n⚠️  중복 발견!")
                print(f"참여자: {participants}")
                print(f"채팅방들: {room_ids}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    check_messages()
