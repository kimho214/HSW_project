from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
import os

# SocketIO 인스턴스를 전역으로 생성 (app과 분리)
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)

    # 환경 변수에서 CORS 설정 로드
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(',')
    CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

    # SocketIO를 Flask 앱에 연결
    socketio.init_app(app, cors_allowed_origins="*", async_mode='eventlet')

    # 데이터베이스 초기화 함수 등록
    from . import db # db는 함수 밖에서 import 해도 안전합니다.
    app.teardown_appcontext(db.close_db)

    # 블루프린트 등록
    with app.app_context():
        from . import auth # 블루프린트 import를 함수 안으로 이동
        from . import projects
        from . import applications
        from . import profiles # 'students.py' -> 'profiles.py' 로 수정
        from . import ai
        from . import messages # 'chat.py' -> 'messages.py' 로 수정
        # socket_events는 main.py에서 명시적으로 등록됨

    app.register_blueprint(auth.auth_bp, url_prefix='/auth')
    app.register_blueprint(projects.projects_bp, url_prefix='/projects')
    app.register_blueprint(applications.applications_bp, url_prefix='/applications')
    app.register_blueprint(profiles.profiles_bp, url_prefix='/profiles')
    app.register_blueprint(ai.ai_bp, url_prefix='/ai')
    app.register_blueprint(messages.messages_bp, url_prefix='/messages')

    # 루트 경로 헬스체크 엔드포인트
    @app.route('/')
    def index():
        return {
            "message": "이음 API Server",
            "status": "running",
            "version": "1.0.0",
            "endpoints": {
                "auth": "/auth",
                "projects": "/projects",
                "applications": "/applications",
                "profiles": "/profiles",
                "ai": "/ai",
                "messages": "/messages"
            }
        }, 200

    return app
