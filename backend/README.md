# CBSK Backend - 게시판 관리 API

## 설정 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.example`을 참고하여 `.env` 파일 생성:

```env
DATABASE_URL=postgresql://username:password@host:port/database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-session-secret
PORT=3000
FRONTEND_URL=http://localhost:8080
```

### 3. 로컬 실행
```bash
npm start
```

## Railway 배포

### 1. Railway 프로젝트 생성
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. "Deploy from GitHub repo" 선택
5. 저장소 선택

### 2. PostgreSQL 데이터베이스 추가
1. 프로젝트에서 "New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 DATABASE_URL이 설정됨

### 3. 환경변수 설정
프로젝트 Settings → Variables에서 추가:
- `ADMIN_USERNAME`: 관리자 아이디
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `SESSION_SECRET`: 랜덤 문자열
- `FRONTEND_URL`: 프론트엔드 URL
- `NODE_ENV`: production

### 4. 배포
- 자동으로 배포됨
- 배포 URL 확인: Settings → Domains

## API 엔드포인트

### 인증
- `POST /api/login` - 로그인
- `POST /api/logout` - 로그아웃
- `GET /api/check-auth` - 인증 상태 확인

### 게시글
- `GET /api/posts` - 목록 조회 (모든 사용자)
- `POST /api/posts` - 작성 (관리자)
- `PUT /api/posts/:id` - 수정 (관리자)
- `DELETE /api/posts/:id` - 삭제 (관리자)

## 데이터베이스 스키마

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
