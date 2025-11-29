# 🚀 프로젝트 등록 기능 설치 가이드

## 📋 구현된 기능

### 백엔드 (Flask)
- ✅ 프로젝트 등록 API (POST /projects)
- ✅ 프로젝트 목록 조회 API (GET /projects)
- ✅ 프로젝트 상세 조회 API (GET /projects/:id)
- ✅ 프로젝트 수정 API (PUT /projects/:id)
- ✅ 프로젝트 삭제 API (DELETE /projects/:id)
- ✅ JWT 인증 (사장님만 프로젝트 등록 가능)

### 프론트엔드 (Next.js)
- ✅ 프로젝트 등록 페이지 (/projects/new)
- ✅ 프로젝트 목록 페이지 (/projects)
- ✅ 실시간 데이터 연동

---

## 🛠️ 설치 방법

### 1단계: 데이터베이스 테이블 생성

백엔드 폴더에서 다음 명령어를 실행하세요:

```bash
cd backend
python setup_database.py
```

또는 MySQL에서 직접 실행:

```bash
mysql -u [사용자명] -p [데이터베이스명] < create_projects_table.sql
```

### 2단계: 백엔드 서버 실행

```bash
cd backend
python main.py
```

서버가 http://localhost:5000 에서 실행됩니다.

### 3단계: 프론트엔드 서버 실행

```bash
cd frontend
npm run dev
```

프론트엔드가 http://localhost:3000 에서 실행됩니다.

---

## 🧪 테스트 방법

### 1. 사장님 계정으로 로그인
- 회원가입 페이지에서 **BUSINESS** 역할로 가입
- 로그인

### 2. 프로젝트 등록
- 헤더 메뉴에서 "프로젝트 등록" 클릭
- 폼 작성 후 제출
  - 제목 (필수)
  - 설명 (필수)
  - 필요 스킬 (필수)
  - 근무 지역 (선택)
  - 급여 (선택)
  - 근무 기간 (선택)

### 3. 프로젝트 목록 확인
- "프로젝트 찾기" 메뉴 클릭
- 등록된 프로젝트 목록 확인
- 검색 기능 테스트

---

## 📡 API 엔드포인트

### 프로젝트 등록
```http
POST http://localhost:5000/projects
Headers:
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}
Body:
  {
    "title": "프로젝트 제목",
    "description": "프로젝트 설명",
    "location": "서울 강남구",
    "salary": "시급 10,000원",
    "duration": "1개월",
    "required_skills": "React, TypeScript"
  }
```

### 프로젝트 목록 조회
```http
GET http://localhost:5000/projects?status=OPEN&location=서울
```

### 프로젝트 상세 조회
```http
GET http://localhost:5000/projects/1
```

### 프로젝트 수정
```http
PUT http://localhost:5000/projects/1
Headers:
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}
Body:
  {
    "title": "수정된 제목",
    "status": "CLOSED"
  }
```

### 프로젝트 삭제
```http
DELETE http://localhost:5000/projects/1
Headers:
  Authorization: Bearer {JWT_TOKEN}
```

---

## 📁 새로 추가된 파일

### 백엔드
- `backend/app/projects.py` - 프로젝트 API 로직
- `backend/create_projects_table.sql` - 테이블 생성 SQL
- `backend/setup_database.py` - 테이블 생성 스크립트

### 프론트엔드
- `frontend/app/projects/new/page.tsx` - 프로젝트 등록 페이지 (수정됨)
- `frontend/app/projects/page.tsx` - 프로젝트 목록 페이지 (수정됨)

---

## 🐛 문제 해결

### CORS 에러가 발생하는 경우
- `backend/app/__init__.py`에서 CORS 설정이 올바른지 확인
- 프론트엔드 요청 URL이 `http://localhost:5000`인지 확인

### 토큰 에러가 발생하는 경우
- 로그인이 되어있는지 확인
- 쿠키에 토큰이 저장되어 있는지 확인 (개발자 도구 > Application > Cookies)

### 데이터베이스 연결 에러
- `.env` 파일의 데이터베이스 설정 확인
- MySQL 서버가 실행 중인지 확인

---

## 📝 다음 단계 제안

1. **프로젝트 지원 기능**
   - 학생이 프로젝트에 지원
   - 사장님이 지원자 관리

2. **인재 프로필 기능**
   - 학생 프로필 등록
   - 인재 검색 페이지

3. **매칭 알림 기능**
   - 새 프로젝트 알림
   - 지원 상태 알림

4. **대시보드**
   - 사장님: 등록한 프로젝트 관리
   - 학생: 지원 현황 확인
