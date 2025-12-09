from flask import Blueprint, request, jsonify
from app.db import get_db
from urllib.parse import unquote
from .auth import token_required
from .utils import format_records # 데이터 포맷팅 유틸리티 가져오기
import os
from dotenv import load_dotenv

load_dotenv()

messages_bp = Blueprint("messages", __name__, url_prefix="/messages")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")

# ==================================================
#   특정 채팅방의 모든 메시지 조회 API (GET /messages/<room_id>)
# ==================================================
@messages_bp.route("/<string:room_id>", methods=["GET"])
def get_messages(room_id):
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        # URL-인코딩된 room_id를 디코딩하여 일관성을 보장합니다.
        decoded_room_id = unquote(room_id)

        # 🔴 디버깅 로그 1: 어떤 room_id로 조회를 요청받았는지 확인

        # DB에서 room_id가 일치하는 모든 메시지를 시간순으로 정렬하여 가져옵니다.
        sql = "SELECT room_id, sender, message, created_at FROM messages WHERE room_id = %s ORDER BY created_at ASC"
        cursor.execute(sql, (decoded_room_id,))
        messages = cursor.fetchall()

        # DB 레코드를 API 응답에 적합한 형식으로 변환 (datetime -> str, None -> "")
        formatted_messages = format_records(messages)

        return jsonify({"messages": formatted_messages}), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch messages"}), 500
    finally:
        if cursor:
            cursor.close()

# ==================================================
#   채팅 메시지 저장 API (POST /messages)
# ==================================================
@messages_bp.route("", methods=["POST"])
def save_message():
    data = request.get_json()
    room_id = data.get("room_id")
    message = data.get("message")
    sender = data.get("sender")

    # POST 요청으로 받은 room_id도 디코딩하여 일관성을 보장합니다.
    decoded_room_id = unquote(room_id) if room_id else None

    # 🔴 디버깅 로그 2: 어떤 데이터로 저장을 요청받았는지 확인

    if not all([decoded_room_id, message, sender]):
        return jsonify({"message": "Missing required fields"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        sql = "INSERT INTO messages (room_id, sender, message) VALUES (%s, %s, %s)"
        cursor.execute(sql, (decoded_room_id, sender, message))
        conn.commit()
        
        return jsonify({"message": "Message saved successfully"}), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to save message"}), 500
    finally:
        if cursor:
            cursor.close()

# ==================================================
#   내 채팅방 목록 조회 API (GET /messages/rooms/my)
# ==================================================
@messages_bp.route("/rooms/my", methods=["GET"])
@token_required
def get_my_chat_rooms():
    my_email = request.user.get("email")
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        # 내가 포함된 모든 채팅방 조회 (room_id에 내 이메일이 포함된 경우)
        sql = """
        SELECT
            room_id,
            sender,
            message,
            created_at
        FROM messages
        WHERE room_id LIKE %s
        ORDER BY created_at DESC
        """
        cursor.execute(sql, (f"%{my_email}%",))
        all_messages = cursor.fetchall()

        # 채팅방별로 그룹화하고 마지막 메시지만 추출
        rooms_dict = {}
        for msg in all_messages:
            room_id = msg['room_id']
            if room_id not in rooms_dict:
                # room_id에서 상대방 이메일 추출
                parts = room_id.split('_')
                opponent_email = parts[0] if parts[0] != my_email else (parts[1] if len(parts) > 1 else '')

                # 상대방 이름 조회
                opponent_name = opponent_email
                try:
                    # 학생인지 확인
                    cursor.execute("""
                        SELECT s.name
                        FROM students s
                        JOIN users u ON s.user_id = u.id
                        WHERE u.email = %s
                    """, (opponent_email,))
                    student = cursor.fetchone()
                    if student:
                        opponent_name = student['name']
                    else:
                        # 사업자인지 확인
                        cursor.execute("""
                            SELECT b.business_name
                            FROM businesses b
                            JOIN users u ON b.user_id = u.id
                            WHERE u.email = %s
                        """, (opponent_email,))
                        business = cursor.fetchone()
                        if business:
                            opponent_name = business['business_name']
                except Exception:
                    # 상대방 이름을 가져오지 못한 경우 이메일을 사용
                    pass

                rooms_dict[room_id] = {
                    'room_id': room_id,
                    'opponent_email': opponent_email,
                    'opponent_name': opponent_name,
                    'last_message': msg['message'],
                    'last_sender': msg['sender'],
                    'last_message_time': msg['created_at'].isoformat() if hasattr(msg['created_at'], 'isoformat') else str(msg['created_at']),
                    'unread': msg['sender'] != my_email  # 간단한 미읽음 표시 (마지막 메시지가 상대방이 보낸 것이면)
                }

        # 리스트로 변환
        rooms_list = list(rooms_dict.values())

        # 마지막 메시지 시간 기준으로 정렬
        rooms_list.sort(key=lambda x: x['last_message_time'], reverse=True)

        return jsonify({
            "message": "success",
            "rooms": rooms_list,
            "count": len(rooms_list)
        }), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch chat rooms"}), 500
    finally:
        if cursor:
            cursor.close()

# ==================================================
#   채팅방 삭제 API (DELETE /messages/rooms/<room_id>)
# ==================================================
@messages_bp.route("/rooms/<string:room_id>", methods=["DELETE"])
@token_required
def delete_chat_room(room_id):
    my_email = request.user.get("email")
    conn = None
    cursor = None

    try:
        # URL 디코딩
        decoded_room_id = unquote(room_id)

        # room_id에 내 이메일이 포함되어 있는지 확인 (권한 체크)
        if my_email not in decoded_room_id:
            return jsonify({"message": "unauthorized to delete this chat room"}), 403

        conn = get_db()
        cursor = conn.cursor()

        # 해당 채팅방의 모든 메시지 삭제
        sql = "DELETE FROM messages WHERE room_id = %s"
        cursor.execute(sql, (decoded_room_id,))
        deleted_count = cursor.rowcount

        conn.commit()

        return jsonify({
            "message": "chat room deleted successfully",
            "deleted_messages": deleted_count
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Failed to delete chat room"}), 500
    finally:
        if cursor:
            cursor.close()
