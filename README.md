# 🎓 대학생 인재 매칭 플랫폼 (Talent Matching Platform)

대학생들과 기업/프로젝트를 연결하는 웹 플랫폼입니다. 학생들은 프로젝트를 찾아 지원하고, 사업자는 인재를 모집할 수 있습니다.

## ✨ 주요 기능

- 🔐 **회원가입/로그인**: 학생 및 사업자 계정 지원
- 👤 **프로필 관리**: 개인 정보 및 포트폴리오 등록
- 📝 **프로젝트 등록/검색**: 프로젝트 게시 및 필터링 기능
- 📄 **지원 시스템**: 자기소개서 제출 및 지원 현황 관리
- 💬 **실시간 채팅**: Socket.IO 기반 1:1 채팅
- 🤖 **AI 자기소개 생성**: Google Gemini API를 활용한 자기소개서 자동 생성
- 📊 **마이페이지**: 대시보드, 통계, 설정 관리
- 🔒 **비밀번호 변경**: 보안 설정 기능

## 🛠 기술 스택

### Frontend
- **Next.js 16.0.3** (App Router)
- **React 19.2.0**
- **TypeScript**
- **Tailwind CSS 4**
- **Socket.IO Client**

### Backend
- **Flask 3.1.0**
- **MySQL** (mysql-connector-python)
- **JWT 인증** (PyJWT)
- **Socket.IO**
- **Google Gemini AI API**

---

## 📋 사전 요구사항

### 공통
- **Git** 설치
- **MySQL 8.0+** 설치 및 실행 중

### Windows
- **Python 3.8+** 설치
- **Node.js 18+** 설치

### macOS
- **Python 3.8+** 설치 (기본 설치되어 있음)
- **Node.js 18+** 설치
- **Homebrew** 권장 (MySQL 설치용)

---

## 🚀 설치 및 실행 가이드

### 1️⃣ 프로젝트 클론

```bash
git clone <repository-url>
cd HSW_project-main-6
```

---

### 2️⃣ MySQL 데이터베이스 설정

#### **Windows**

1. **MySQL 설치**: [MySQL 공식 사이트](https://dev.mysql.com/downloads/installer/)에서 설치
2. **MySQL 실행**: Windows 서비스에서 MySQL80 시작
3. **데이터베이스 생성**:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE talent_match CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

4. **테이블 생성**:
   ```bash
   cd backend
   mysql -u root -p talent_match < db_schema.sql
   ```

#### **macOS**

1. **MySQL 설치** (Homebrew 사용):
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. **데이터베이스 생성**:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE talent_match CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. **테이블 생성**:
   ```bash
   cd backend
   mysql -u root -p talent_match < db_schema.sql
   ```

---

### 3️⃣ 백엔드 설정

#### **Windows**

```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
copy .env.example .env
# .env 파일을 열어 MySQL 비밀번호 및 API 키 설정
notepad .env
```

#### **macOS**

```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 MySQL 비밀번호 및 API 키 설정
nano .env
```

#### **`.env` 파일 설정 예시**

```env
FLASK_ENV=development
SECRET_KEY=your-very-secure-random-key-at-least-32-characters-long-change-this

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password  # ⚠️ 필수: MySQL 비밀번호 입력
DB_NAME=talent_match
DB_PORT=3306

ALLOWED_ORIGINS=http://localhost:3000
API_URL=http://localhost:5000

# Google Gemini API Key for AI features
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here  # ⚠️ 선택: AI 자기소개 기능 사용 시 필수
```

> **중요**:
> - `DB_PASSWORD`: MySQL 비밀번호를 입력해야 합니다
> - `GEMINI_API_KEY`: AI 자기소개 생성 기능을 사용하려면 본인의 API 키를 발급받아 입력해야 합니다 (아래 섹션 참고)

---

### 4️⃣ 프론트엔드 설정

#### **Windows & macOS 공통**

```bash
# 1. 프론트엔드 디렉토리로 이동
cd ../frontend

# 2. 의존성 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# Windows: copy .env.example .env.local

# 4. .env.local 파일 확인 (기본값 사용 가능)
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 5️⃣ 서버 실행

#### **터미널 1 - 백엔드 서버 실행**

##### Windows
```bash
cd backend
venv\Scripts\activate
python run.py
```

##### macOS
```bash
cd backend
source venv/bin/activate
python run.py
```

✅ 백엔드 서버: `http://localhost:5000`

---

#### **터미널 2 - 프론트엔드 서버 실행**

```bash
cd frontend
npm run dev
```

✅ 프론트엔드 서버: `http://localhost:3000`

---

## 📝 Google Gemini API 키 발급 (선택사항)

AI 자기소개 생성 기능을 사용하려면 Google Gemini API 키가 필요합니다.

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Get API Key" 클릭
4. 생성된 API 키를 복사하여 `backend/.env` 파일의 `GEMINI_API_KEY`에 입력

> **참고**: API 키 없이도 프로젝트의 다른 모든 기능은 정상 작동합니다. AI 자기소개 생성 기능만 사용할 수 없습니다.

---

## 🗂 프로젝트 구조

```
HSW_project-main-6/
├── backend/                 # Flask 백엔드
│   ├── app/
│   │   ├── __init__.py     # Flask 앱 초기화
│   │   ├── auth.py         # 인증 API (회원가입, 로그인, 비밀번호 변경)
│   │   ├── projects.py     # 프로젝트 관련 API
│   │   ├── applications.py # 지원 관련 API
│   │   ├── students.py     # 학생 프로필 API
│   │   ├── ai.py           # AI 자기소개 생성 API
│   │   ├── chat.py         # 채팅 API
│   │   └── db.py           # 데이터베이스 연결
│   ├── run.py              # 서버 실행 파일
│   ├── requirements.txt    # Python 패키지 목록
│   ├── .env.example        # 환경 변수 예시
│   └── db_schema.sql       # 데이터베이스 스키마
│
├── frontend/               # Next.js 프론트엔드
│   ├── app/
│   │   ├── page.tsx        # 홈페이지
│   │   ├── login/          # 로그인 페이지
│   │   ├── signup/         # 회원가입 페이지
│   │   ├── profile/        # 프로필 페이지
│   │   ├── mypage/         # 마이페이지
│   │   ├── projects/       # 프로젝트 목록/상세
│   │   ├── students/       # 인재 찾기
│   │   └── chat/           # 채팅 페이지
│   ├── components/         # React 컴포넌트
│   ├── package.json        # npm 패키지 목록
│   └── .env.example        # 환경 변수 예시
│
└── README.md               # 이 파일
```

---

## 🎯 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈페이지 |
| `/login` | 로그인 |
| `/signup` | 회원가입 (학생/사업자 선택) |
| `/profile` | 프로필 편집 (AI 자기소개 생성 포함) |
| `/mypage` | 마이페이지 (대시보드, 통계, 설정) |
| `/projects` | 프로젝트 목록 |
| `/projects/:id` | 프로젝트 상세 |
| `/projects/new` | 프로젝트 등록 (사업자 전용) |
| `/students` | 인재 찾기 (사업자 전용) |
| `/students/:id` | 학생 포트폴리오 |
| `/chat/:roomId` | 1:1 채팅 |
| `/chats` | 채팅 목록 |

---

## ⚠️ 문제 해결

### MySQL 연결 오류
```
Error: Can't connect to MySQL server
```
- MySQL 서버가 실행 중인지 확인
- `backend/.env` 파일의 `DB_PASSWORD` 확인
- 방화벽에서 MySQL 포트(3306) 허용 확인

### 포트 이미 사용 중 오류
```
Error: Address already in use
```
- **백엔드 (5000번 포트)**:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # macOS
  lsof -ti:5000 | xargs kill -9
  ```

- **프론트엔드 (3000번 포트)**:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # macOS
  lsof -ti:3000 | xargs kill -9
  ```

### npm 설치 오류
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json  # macOS
# Windows: rmdir /s /q node_modules && del package-lock.json
npm install
```

### Python 가상환경 활성화 안 됨 (Windows)
```bash
# PowerShell 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📄 라이선스

이 프로젝트는 대학 캡스톤 프로젝트로 제작되었습니다.

---

## 👥 개발자

- 개발자: HSW Team
- 프로젝트 기간: 2024-2025

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
