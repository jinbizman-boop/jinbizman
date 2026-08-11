# JINBIZ Neon Postgres

## 마이그레이션

정확히 12개의 순차 프로덕션 마이그레이션으로 구성됩니다.

1. `001_core_org_auth.sql`
2. `002_service_hub.sql`
3. `003_public_content.sql`
4. `004_projects_wbs.sql`
5. `005_daily_reports_logs.sql`
6. `006_approvals.sql`
7. `007_evaluations.sql`
8. `008_domains_locales.sql`
9. `009_audit_notifications.sql`
10. `010_indexes_constraints.sql`
11. `011_production_hardening.sql`
12. `012_workplace_operations.sql`

`009`에는 공개 문의 API의 고정 윈도우 rate limit 버킷도 포함되어 있습니다.

## 실행 순서

```bash
npm install
```

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars`의 `DATABASE_URL`을 실제 Neon connection string으로 교체합니다.

```bash
set DATABASE_URL=실제_NEON_DATABASE_URL
```

Windows PowerShell에서는:

```powershell
$env:DATABASE_URL="실제_NEON_DATABASE_URL"
```

마이그레이션:

```bash
npm run db:migrate
```

기본 운영 시드(RBAC/부서만):

```bash
npm run db:seed
```

`sample-*.sql`은 자동 실행되지 않는 선택 개발 데이터입니다. 운영 계정 비밀번호를 seed SQL에 저장하지 않습니다.

최초 관리자 생성:

```powershell
$env:ADMIN_EMAIL="admin@jinbizman.com"
```

```powershell
$env:ADMIN_PASSWORD="충분히_긴_실제_비밀번호"
```

```powershell
$env:ADMIN_NAME="관리자 이름"
```

```bash
npm run admin:create
```

## 보안 원칙

- 실제 `DATABASE_URL`은 Git에 커밋하지 않습니다.
- 실제 관리자 비밀번호를 seed SQL에 넣지 않습니다.
- 브라우저에서 Neon DB에 직접 접속하지 않습니다.
- 모든 DB 접근은 Worker API를 거칩니다.
