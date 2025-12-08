# eventlet monkey patching을 가장 먼저 실행 (다른 import보다 앞에 위치)
import eventlet
eventlet.monkey_patch()

from app import create_app, socketio
from app.socket_events import register_socket_handlers

# Flask 앱 생성 (CORS는 __init__.py에서 설정됨)
app = create_app()

# Socket.IO 이벤트 핸들러 등록 (반드시 앱 생성 후에 호출)
register_socket_handlers(socketio)
print("Socket.IO event handlers registered")  # 디버깅용

if __name__ == '__main__':
    # SocketIO로 앱 실행 (개발 모드)
    socketio.run(app, debug=True, port=5000)
