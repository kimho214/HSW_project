"""
Socket.IO 이벤트 핸들러
이 모듈은 main.py에서 명시적으로 import되어야 합니다.
"""
from flask_socketio import emit, join_room
from app.db import get_db
import logging
from urllib.parse import unquote
import datetime

logger = logging.getLogger(__name__)

# socketio 인스턴스를 지연 import하여 순환 의존성 방지
def register_socket_handlers(socketio):
    """
    Socket.IO 이벤트 핸들러를 등록합니다.
    이 함수는 Flask 앱 생성 후에 호출되어야 합니다.
    """

    @socketio.on('connect')
    def handle_connect():
        logger.info('Client connected')
        print('Client connected')  # 디버깅용

    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info('Client disconnected')
        print('Client disconnected')  # 디버깅용

    @socketio.on('join_room')
    def handle_join_room(room_id):
        """클라이언트가 특정 채팅방에 참여. room_id를 디코딩하여 사용."""
        decoded_room_id = unquote(room_id)
        join_room(decoded_room_id)
        logger.info(f'Client joined room: {decoded_room_id} (raw: {room_id})')
        print(f'Client joined room: {decoded_room_id} (raw: {room_id})')  # 디버깅용

    @socketio.on('send_message')
    def handle_send_message(data):
        """
        클라이언트로부터 메시지를 받아서:
        1. 해당 채팅방의 모든 클라이언트에게 브로드캐스트
        2. DB에 저장
        """
        print(f'Received message: {data}')  # 디버깅용

        room_id_raw = data.get('room_id')
        message = data.get('message')
        sender = data.get('sender')

        if not all([room_id_raw, message, sender]):
            logger.error('Missing required fields in send_message')
            print('Missing required fields in send_message')
            return

        decoded_room_id = unquote(room_id_raw)

        # 클라이언트에 전송할 데이터 객체를 새로 생성합니다.
        # DB에서 가져오는 데이터와 형식을 맞추기 위해 타임스탬프를 추가합니다.
        broadcast_data = {
            'room_id': decoded_room_id,
            'sender': sender,
            'message': message,
            'created_at': datetime.datetime.utcnow().isoformat() + 'Z'  # ISO 8601 형식, UTC 명시
        }

        # 채팅방의 모든 사용자에게 메시지 전송
        emit('receive_message', broadcast_data, room=decoded_room_id)
        print(f'Message emitted to room: {decoded_room_id}')

        # DB에 메시지 저장
        conn = None
        cursor = None
        try:
            conn = get_db()
            cursor = conn.cursor()

            sql = "INSERT INTO messages (room_id, sender, message) VALUES (%s, %s, %s)"
            cursor.execute(sql, (decoded_room_id, sender, message))
            conn.commit()

            logger.info(f'Message saved: room={decoded_room_id}, sender={sender}')
            print(f'Message saved to DB: room={decoded_room_id}, sender={sender}')

        except Exception as e:
            logger.error(f'Failed to save message: {e}')
            print(f'Failed to save message: {e}')
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
