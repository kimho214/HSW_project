from flask import Flask
from flask_cors import CORS
from app.auth import auth_bp
from app.projects import projects_bp
from app.applications import applications_bp
from app.profiles import profiles_bp
from app.ai import ai_bp
import os
from dotenv import load_dotenv
from . import messages

load_dotenv()

def create_app():
    app = Flask(__name__)

    # CORS 설정 (환경변수에서 허용 도메인 가져오기)
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # Blueprint 등록
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(projects_bp, url_prefix="/projects")
    app.register_blueprint(applications_bp, url_prefix="/applications")
    app.register_blueprint(profiles_bp, url_prefix="/profiles")
    app.register_blueprint(messages.messages_bp, url_prefix="/messages")
    app.register_blueprint(ai_bp, url_prefix="/ai")

    return app
