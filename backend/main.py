# eventlet monkey patching을 가장 먼저 실행 (다른 import보다 앞에 위치)
import eventlet
eventlet.monkey_patch()

from app import create_app, socketio

# Flask 앱 생성 (CORS는 __init__.py에서 설정됨)
app = create_app()

# Socket.IO 이벤트 핸들러를 명시적으로 import (Gunicorn 환경에서 필요)
with app.app_context():
    from app import socket_events

if __name__ == '__main__':
    # SocketIO로 앱 실행 (개발 모드)
    socketio.run(app, debug=True, port=5000)
