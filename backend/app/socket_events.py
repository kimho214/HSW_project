from flask_socketio import emit, join_room
from app import socketio
from app.db import get_db
import logging

logger = logging.getLogger(__name__)

@socketio.on('connect')
def handle_connect():
    logger.info(f'Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f'Client disconnected')

@socketio.on('join_room')
def handle_join_room(room_id):
    """클라이언트가 특정 채팅방에 참여"""
    join_room(room_id)
    logger.info(f'Client joined room: {room_id}')

@socketio.on('send_message')
def handle_send_message(data):
    """
    클라이언트로부터 메시지를 받아서:
    1. 해당 채팅방의 모든 클라이언트에게 브로드캐스트
    2. DB에 저장
    """
    room_id = data.get('room_id')
    message = data.get('message')
    sender = data.get('sender')

    if not all([room_id, message, sender]):
        logger.error('Missing required fields in send_message')
        return

    # 채팅방의 모든 사용자에게 메시지 전송
    emit('receive_message', data, room=room_id)

    # DB에 메시지 저장
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        sql = "INSERT INTO messages (room_id, sender, message) VALUES (%s, %s, %s)"
        cursor.execute(sql, (room_id, sender, message))
        conn.commit()

        logger.info(f'Message saved: room={room_id}, sender={sender}')

    except Exception as e:
        logger.error(f'Failed to save message: {e}')
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
