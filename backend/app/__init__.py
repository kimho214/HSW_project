from flask import Flask
from flask_cors import CORS
from app.auth import auth_bp

def create_app():
    app = Flask(__name__)

    # 🔥 CORS 완전 활성화 (OPTIONS 포함)
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # 🔥 Blueprint 등록
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app

