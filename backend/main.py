from app import create_app
from flask_cors import CORS
import os

app = create_app()

# CORS 설정 - 환경변수에서 허용된 오리진 가져오기
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

CORS(
    app,
    resources={r"/*": {"origins": allowed_origins}},
    supports_credentials=True
)

if __name__ == '__main__':
    app.run(debug=True)
