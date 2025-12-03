# ============================
#   회원가입 API
# ============================
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data.get("email")
    hashed_pw = generate_password_hash(password)

    try:
        conn = None
        cursor = None
        conn = get_db()
        cursor = conn.cursor()

# ============================
#   로그인 API
# ============================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
        return jsonify({"message": "missing fields"}), 400

    try:
        conn = None
        cursor = None
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

# ============================
#   비밀번호 변경 API
# ============================
@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    # JWT 토큰에서 사용자 정보 가져오기
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "New password must be at least 6 characters"}), 400

    try:
        conn = None
        cursor = None
        conn = get_db()
        cursor = conn.cursor(dictionary=True)


