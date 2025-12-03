from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    # 환경 변수에서 CORS 설정 로드
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(',')
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    # 데이터베이스 초기화 함수 등록
    from . import db
    app.teardown_appcontext(db.close_db)

    # 블루프린트 등록
    from . import auth
    from . import projects
    from . import applications
    from . import students
    from . import ai
    from . import chat

    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects.projects_bp, url_prefix='/api/projects')
    app.register_blueprint(applications.applications_bp, url_prefix='/api/applications')
    app.register_blueprint(students.students_bp, url_prefix='/api/students')
    app.register_blueprint(ai.ai_bp, url_prefix='/api/ai')
    app.register_blueprint(chat.chat_bp, url_prefix='/api/chat')

    return app
