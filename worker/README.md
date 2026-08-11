# JINBIZ Cloudflare Worker API

## 역할

`worker/`는 브라우저에서 직접 접근할 수 없는 서버 영역입니다. Neon DB 접속, 로그인, 권한 검사, 문의 저장, ERP 조회 API를 이곳에서 처리합니다.

## 주요 API

### 공개 API

- `GET /api/health`
- `GET /api/public/services`
- `GET /api/public/news?locale=ko&limit=12`
- `POST /api/public/inquiries`

### 인증 API

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### ERP API

- `GET /api/admin/dashboard`
- `GET /api/admin/inquiries`
- `PATCH /api/admin/inquiries/:id`
- `GET /api/admin/projects`
- `GET /api/admin/wbs?projectId=1`
- `GET /api/admin/approvals`
- `GET /api/admin/evaluations`
- `GET /api/admin/services`
- `GET /api/admin/news`

## 응답 형식

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 문장"
  }
}
```

## 인증

관리자 로그인 성공 시 서버가 `HttpOnly`, `SameSite=Strict` 세션 쿠키를 발급합니다. 운영 환경에서는 `Secure` 속성도 적용됩니다. `/admin/*` 경로는 Worker가 먼저 실행되어 세션이 없으면 `/admin/login.html`로 이동합니다.

비밀번호는 코드에 저장하지 않습니다. `scripts/create-admin.mjs`가 PBKDF2-SHA256 해시를 생성하여 DB에 저장합니다.
