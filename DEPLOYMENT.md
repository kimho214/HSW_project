# 배포 가이드

## Backend (Render)

### 1. Render Dashboard 설정

**Web Service 설정:**
- Name: `hsw-backend` (또는 원하는 이름)
- Region: Singapore
- Branch: `main`
- Root Directory: `backend`
- Runtime: Python 3

### 2. Build & Start Commands

**Build Command:**
```bash
./build.sh
```

**Start Command (중요!):**
```bash
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT main:app
```

또는:
```bash
chmod +x render_start.sh && ./render_start.sh
```

### 3. Environment Variables

Render Dashboard → Environment 탭에서 다음 변수 추가:

```
DATABASE_URL=<Render PostgreSQL URL>
SECRET_KEY=<임의의 긴 랜덤 문자열>
GEMINI_API_KEY=<Google Gemini API 키>
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app.vercel.app
```

**중요:**
- `ALLOWED_ORIGINS`에 Vercel 도메인을 정확히 입력
- 여러 도메인은 쉼표로 구분

---

## Frontend (Vercel)

### Environment Variables

Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**중요:**
- `NEXT_PUBLIC_API_URL`은 Render Backend URL과 정확히 일치해야 함
- 끝에 슬래시(`/`) 없이 입력

---

## 배포 체크리스트

### Backend 배포 후 확인사항:

1. ✅ Start Command가 `gunicorn --worker-class eventlet -w 1 main:app`인지 확인
2. ✅ Logs에서 `Socket.IO server listening` 메시지 확인
3. ✅ Health check: `https://your-backend.onrender.com/` 접속 시 JSON 응답 확인

### Frontend 배포 후 확인사항:

1. ✅ `NEXT_PUBLIC_API_URL` 환경변수가 올바른지 확인
2. ✅ 브라우저 콘솔에서 Socket.IO 연결 에러가 없는지 확인
3. ✅ 채팅 메시지 실시간 전송/수신 테스트

---

## 트러블슈팅

### 채팅이 실시간으로 작동하지 않는 경우:

1. **Backend Start Command 확인:**
   - Render Dashboard → Settings → Build & Deploy
   - Start Command가 `eventlet` worker를 사용하는지 확인

2. **Socket.IO 연결 확인:**
   - 브라우저 개발자 도구 → Network 탭
   - `socket.io` 요청이 성공(101 Switching Protocols)하는지 확인

3. **CORS 설정 확인:**
   - Backend 환경변수 `ALLOWED_ORIGINS`에 Frontend 도메인이 포함되어 있는지 확인

4. **Render Logs 확인:**
   - Render Dashboard → Logs
   - Socket.IO 관련 에러 메시지 확인

### 일반적인 에러:

**"Failed to connect to Socket.IO"**
→ Backend가 eventlet worker로 실행되지 않음. Start Command 확인.

**"CORS policy error"**
→ `ALLOWED_ORIGINS` 환경변수에 Frontend 도메인 추가.

**"Messages not saved to DB"**
→ `DATABASE_URL` 환경변수 확인.
