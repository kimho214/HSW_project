from app import create_app, socketio

# Flask 앱 생성 (CORS는 __init__.py에서 설정됨)
app = create_app()

if __name__ == '__main__':
    # SocketIO로 앱 실행 (개발 모드)
    socketio.run(app, debug=True, port=5000)
