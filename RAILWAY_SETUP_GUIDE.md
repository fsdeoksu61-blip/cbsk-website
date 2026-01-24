# Railway 배포 가이드 - CBSK 게시판

## 📋 준비사항
- Railway 계정 (https://railway.app)
- GitHub 저장소: fsdeoksu61-blip/cbsk-website

---

## 1단계: Railway 프로젝트 생성

### 1. Railway 접속
1. https://railway.app 접속
2. 로그인 (기존 계정 사용)

### 2. 새 프로젝트 생성
1. 대시보드에서 **"New Project"** 버튼 클릭
2. **"Deploy from GitHub repo"** 선택
3. 저장소 목록에서 **"cbsk-website"** 선택
   - 만약 목록에 안 보이면 "Configure GitHub App" 클릭하여 권한 추가

### 3. 서비스 설정
배포가 시작되면 다음 설정이 필요합니다:

1. 프로젝트 이름 클릭 (생성된 서비스)
2. **Settings** 탭으로 이동
3. **"Root Directory"** 찾기
4. 값을 **"/backend"** 로 변경
5. **"Start Command"** 확인 (자동으로 "npm start" 설정됨)

---

## 2단계: PostgreSQL 데이터베이스 추가

### 1. 데이터베이스 생성
1. 프로젝트 대시보드로 돌아가기 (왼쪽 상단 프로젝트 이름 클릭)
2. **"+ New"** 버튼 클릭
3. **"Database"** 선택
4. **"Add PostgreSQL"** 선택

### 2. 데이터베이스 연결 확인
- PostgreSQL이 생성되면 자동으로 백엔드 서비스와 연결됩니다
- DATABASE_URL 환경변수가 자동으로 설정됩니다

---

## 3단계: 환경변수 설정

### 1. 백엔드 서비스 선택
1. 프로젝트 대시보드에서 백엔드 서비스(cbsk-website) 클릭
2. **"Variables"** 탭으로 이동

### 2. 환경변수 추가
다음 변수들을 **"New Variable"** 버튼으로 하나씩 추가:

```
변수명: ADMIN_USERNAME
값: admin

변수명: ADMIN_PASSWORD
값: [누나가 사용할 안전한 비밀번호]

변수명: SESSION_SECRET
값: [랜덤한 긴 문자열, 예: cbsk2025secretkey123456789]

변수명: NODE_ENV
값: production

변수명: FRONTEND_URL
값: https://fsdeoksu61-blip.github.io
```

### 3. 저장
- 모든 변수 입력 후 자동 저장됨
- 서비스가 자동으로 재배포됩니다

---

## 4단계: 도메인 생성 및 확인

### 1. 공개 URL 생성
1. 백엔드 서비스의 **"Settings"** 탭으로 이동
2. **"Networking"** 섹션 찾기
3. **"Generate Domain"** 버튼 클릭
4. 생성된 URL 복사 (예: https://cbsk-backend-production.up.railway.app)

### 2. 배포 상태 확인
1. **"Deployments"** 탭으로 이동
2. 최신 배포가 "SUCCESS" 상태인지 확인
3. 로그 확인:
   ```
   Database initialized successfully
   Server is running on port 3000
   ```

---

## 5단계: 프론트엔드 API URL 업데이트

Railway에서 생성된 URL을 프론트엔드 코드에 연결해야 합니다.

### 파일 위치
`C:\Users\JC-1805302\cbsk\information\board.js`

### 수정할 내용
**기존 (2번째 줄):**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**변경 후:**
```javascript
const API_URL = 'https://[Railway에서-생성된-도메인]/api';
```

예시:
```javascript
const API_URL = 'https://cbsk-backend-production.up.railway.app/api';
```

### Git 커밋 & 푸시
```bash
git add information/board.js
git commit -m "Update API URL for Railway production"
git push
```

---

## 6단계: 테스트

### 1. 웹사이트 접속
https://fsdeoksu61-blip.github.io/information/information.html

### 2. 기능 테스트
1. **로그인 테스트**
   - 우측 상단 "로그인" 버튼 클릭
   - 설정한 ADMIN_USERNAME과 ADMIN_PASSWORD 입력
   - 로그인 성공 확인

2. **게시글 작성 테스트**
   - "새 글 쓰기" 버튼 클릭
   - 제목과 날짜 입력
   - 저장 후 목록에 표시되는지 확인

3. **게시글 수정 테스트**
   - 게시글 옆 "수정" 버튼 클릭
   - 제목 변경 후 저장

4. **게시글 삭제 테스트**
   - 게시글 옆 "삭제" 버튼 클릭
   - 확인 후 삭제

---

## 🔧 문제 해결

### 문제 1: "게시글을 불러오는데 실패했습니다"
**원인:** API 연결 실패

**해결방법:**
1. Railway 배포 상태 확인 (Deployments 탭)
2. 브라우저 개발자도구(F12) → Console 탭에서 에러 확인
3. board.js의 API_URL이 정확한지 확인
4. Railway 서비스가 실행 중인지 확인

### 문제 2: 로그인 실패
**원인:** 아이디/비밀번호 불일치 또는 세션 설정 오류

**해결방법:**
1. Railway Variables에서 ADMIN_USERNAME, ADMIN_PASSWORD 확인
2. 대소문자 정확히 입력
3. SESSION_SECRET이 설정되어 있는지 확인

### 문제 3: 배포 실패
**원인:** 환경변수 누락 또는 DATABASE_URL 문제

**해결방법:**
1. PostgreSQL이 정상 실행 중인지 확인
2. 모든 환경변수가 설정되었는지 확인
3. Railway Deployments → Logs에서 에러 메시지 확인

---

## 📞 누나에게 전달할 정보

### 관리자 로그인 정보
```
URL: https://fsdeoksu61-blip.github.io/information/information.html
아이디: [ADMIN_USERNAME에 설정한 값]
비밀번호: [ADMIN_PASSWORD에 설정한 값]
```

### 사용 방법
1. **로그인**: 자료실 페이지 우측 상단 "로그인" 버튼
2. **글 작성**: "새 글 쓰기" 버튼 → 제목/날짜 입력 → 저장
3. **글 수정**: 게시글 옆 "수정" 버튼
4. **글 삭제**: 게시글 옆 "삭제" 버튼
5. **로그아웃**: 우측 상단 "로그아웃" 버튼

---

## ✅ 완료 체크리스트

- [ ] Railway 프로젝트 생성
- [ ] Root Directory를 /backend로 설정
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경변수 5개 모두 설정
- [ ] 도메인 생성 완료
- [ ] 배포 성공 확인 (Deployments 탭)
- [ ] board.js의 API_URL 업데이트
- [ ] Git 커밋 & 푸시
- [ ] 웹사이트에서 로그인 테스트 성공
- [ ] 게시글 작성/수정/삭제 테스트 성공

모든 항목이 체크되면 배포 완료입니다! 🎉
