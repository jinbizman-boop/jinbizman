# JINBIZ ERP API 명세서 최신형 완성형 최종본

## 이번 단계 목표

* 첨부 기준 문서들과 지금까지 확정된 채팅 방향을 모두 반영해 **`docs/api/erp-api.md` 최신형 완성형 최종본**을 다시 정리합니다.
* 이번 문서는 외부 홈페이지와 내부 ERP를 함께 받치는 API 중, **`/api/erp/*` 범위만 집중적으로 다루는 ERP API 실행 기준서**입니다.
* 기존 확정안에 아래 3가지를 정식 요구사항으로 추가 확정합니다.

  * **PC, 모바일, 태블릿 등 모든 기기와 모든 환경에서 깨지거나 이탈되지 않는 반응형 웹앱을 가능하게 하는 summary/detail 응답 구조**
  * **한국어, 영어, 일본어, 불어, 스페인어 공식 지원**
  * **대표 도메인 `www.jinbizman.com` 사용**

* 이번 최종본은 보기 좋은 개요 문서가 아니라 **바로 구현 착수 가능한 ERP API 기준서**로 작성합니다.
* `MangePage-Main-Guide`, `Backend-Develop-Guide`, `Frontend-Develop-Guide`, `Develop-Total-Guide`, `Development-Execution`, `HomePage-Main-Guide`에 공통으로 반영된 **프로젝트 / WBS / 아침 업무보고 / 퇴근 업무일지 / 결재 / 평가 근거 데이터** 흐름을 ERP API 범위에 맞게 재조립합니다.
* 기존 문서의 구조적 연속성은 유지하되, 실제 구현에서 바로 사용할 수 있도록 **상태 전이 규칙, summary/detail 응답 설계, evidence 집계 규칙, 검증 규칙, 권한 정책, 구현 우선순위, 5단계 배포 완료 기준 연계**를 더 촘촘하게 보강합니다.

---

## 변경 파일

이번 단계는 문서화 단계라 실제 코드 수정 파일은 없습니다.

다만 이 문서를 기준으로 바로 연결될 핵심 백엔드 파일은 아래가 맞습니다.

* `worker/routes/erp/projects.ts`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/wbs-templates.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`
* `worker/routes/erp/approvals.ts`
* `worker/routes/erp/evaluations.ts`
* `worker/lib/auth.ts`
* `worker/lib/permissions.ts`
* `worker/lib/response.ts`
* `worker/lib/errors.ts`
* `worker/lib/locale.ts`
* `worker/lib/domain.ts`
* `worker/lib/logger.ts`
* `worker/lib/validators.ts`
* `worker/middleware/auth.ts`
* `worker/middleware/require-permission.ts`
* `worker/middleware/scope-check.ts`
* `worker/middleware/audit.ts`
* `worker/middleware/request-id.ts`
* `db/migrations/*`

관련 프론트 연결 파일은 아래가 맞습니다.

* `src/lib/api.ts`
* `src/lib/types.ts`
* `src/lib/permissions.ts`
* `src/lib/validators.ts`
* `src/pages/admin/wbs/*`
* `src/pages/admin/approvals/*`
* `src/pages/admin/evaluations/*`
* `src/components/admin/WbsKanbanBoard.tsx`
* `src/components/admin/WbsTaskDrawer.tsx`
* `src/components/admin/DataTable.tsx`
* `src/components/admin/PermissionGate.tsx`
* `src/components/admin/MetricCard.tsx`

---

## 실행 명령어

```bash
npm install
npm run dev
npx wrangler dev
```

ERP API 문서 적용 후 실제 개발 착수 시 권장 흐름은 아래를 유지합니다.

```bash
npm create cloudflare@latest -- jinbiz --framework=react
npm install
npm install hono @hono/zod-validator @hono/zod-openapi zod
npm install @neondatabase/serverless
npm install jose
npm install -D vitest @cloudflare/vitest-pool-workers
npm run dev
npm run build
npx wrangler dev
npx wrangler deploy
```

---

## 확인 방법

아래가 맞으면 이번 ERP API 문서는 정상으로 봐도 됩니다.

* ERP API 범위가 **프로젝트 / WBS / WBS 템플릿 / 아침 업무보고 / 퇴근 업무일지 / 결재 / 평가**로 명확히 분리되어 있는지
* 모든 업무 데이터가 **프로젝트와 WBS를 중심으로 연결**되는지
* 업무보고와 업무일지가 **WBS 없는 상태로 저장되지 않도록** 규칙이 반영되어 있는지
* 결재와 평가가 단순 점수 입력이 아니라 **근거 데이터와 승인 흐름**을 전제로 하는지
* 프로젝트/WBS 목록 응답과 상세 응답이 분리되어 **반응형 UI에서 카드/테이블/드로어로 안전하게 쓸 수 있는지**
* 지연 사유, 실제 진척률, 산출물, 승인 이력이 ERP API 안에서 추적 가능한지
* 평가가 점수만 남지 않고 **WBS·산출물·결재 같은 evidence** 중심으로 설계되어 있는지
* 상태값 표준이 프론트와 백엔드에서 동일하게 쓸 수 있도록 정리되어 있는지
* ERP API도 다국어와 도메인 정책을 깨뜨리지 않도록 공통 규칙을 따르는지
* 문서 마지막 체크리스트로 기존 파일을 즉시 대체할 수 있는지 확인 가능한지

---

## 문제 발생 시

* WBS 없이 업무보고부터 만들면 진척도, 지연 사유, 평가 근거가 분리됩니다.
* 프로젝트와 WBS를 별도 모듈처럼 느슨하게 두면 ERP 핵심 엔진이 무너집니다.
* 결재를 문서 저장 수준으로만 만들면 일정 연장, 게시 승인, 예산 승인 흐름이 연결되지 않습니다.
* 평가를 점수 입력 화면부터 만들면 평가 근거 데이터 구조가 뒤늦게 꼬입니다.
* 목록 API에 상세 payload를 모두 실으면 모바일 카드 뷰와 데스크톱 상세 뷰가 모두 비효율적입니다.
* 상태 전환 규칙을 제한하지 않으면 `approval_wait -> done`, `draft -> finalized` 같은 잘못된 전이가 생깁니다.
* 실제 진척률과 계획 진척률 범위를 강제하지 않으면 보고 데이터가 통계에 쓸 수 없는 값으로 오염됩니다.
* ERP API를 관리자 API와 섞어 쓰면 서비스 허브/사이트 운영과 프로젝트/WBS 운영 경계가 흐려집니다.
* 평가 근거 데이터보다 점수 입력을 먼저 만들면 5단계 배포 완료 기준을 만족할 수 없습니다.

---

# 1. 최종 정의

이 문서에서 말하는 ERP API의 정답은 단순한 “사내 업무 CRUD 모음”이 아닙니다.

정답은 아래입니다.

> **JINBIZ ERP API는 프로젝트 실행, WBS 관리, 아침 업무보고, 퇴근 업무일지, 전자결재, 평가 근거 데이터 집계를 하나의 권한 체계와 감사 체계 안에서 묶어 관리하는 실행 중심 ERP API 계층이다.**

이 API는 아래 전제를 반드시 지켜야 합니다.

* 모든 업무는 **프로젝트에 속한다.**
* 모든 실무 기록은 **WBS에 연결된다.**
* 아침 업무보고와 퇴근 업무일지는 **WBS 없는 상태로 저장할 수 없다.**
* 결재는 문서 승인 기능이 아니라 **운영 통제 흐름**이다.
* 평가는 점수 입력 기능이 아니라 **evidence 수집 + 점수 확정 흐름**이다.
* ERP API는 관리자 API의 서비스 허브/사이트 운영과 이어지되, ERP 범위에서는 **실행 데이터**를 우선한다.
* 대표 공개 도메인은 항상 **`www.jinbizman.com`** 이다.
* 공식 지원 언어는 항상 **`ko`, `en`, `ja`, `fr`, `es`** 이다.
* 프론트는 summary/detail 분리 응답을 전제로 하므로, ERP API도 **목록 요약 응답과 상세 응답을 명확히 분리**해야 한다.
* 평가 점수는 근거 데이터를 대체하지 못하므로, **evidence가 선행되지 않은 score/finalize는 차단**한다.

---

# 2. 문서 범위

이 문서는 아래 경로만 다룹니다.

## 2-1. 핵심 ERP 라우트

* `/api/erp/projects`
* `/api/erp/projects/:id`
* `/api/erp/projects/:id/members`
* `/api/erp/wbs`
* `/api/erp/wbs/:id`
* `/api/erp/wbs/:id/dependencies`
* `/api/erp/wbs-templates`
* `/api/erp/wbs-templates/:id`
* `/api/erp/daily-reports`
* `/api/erp/daily-reports/:id`
* `/api/erp/daily-logs`
* `/api/erp/daily-logs/:id`
* `/api/erp/approvals`
* `/api/erp/approvals/:id`
* `/api/erp/approvals/:id/actions`
* `/api/erp/evaluations/cycles`
* `/api/erp/evaluations/cycles/:id`
* `/api/erp/evaluations/evidences`
* `/api/erp/evaluations/scores`
* `/api/erp/evaluations/finalize`

## 2-2. 이 문서에서 직접 다루지 않는 라우트

* Public API: `/api/health`, `/api/news`, `/api/inquiries`, `/api/site/pages/*`, `/api/locales`
* Admin API: `/api/admin/services`, `/api/admin/site-content`, `/api/admin/site-seo`, `/api/admin/translations`, `/api/admin/news`, `/api/admin/inquiries`
* System API: `/api/system/audit-logs`, `/api/system/settings`, `/api/docs`

단, ERP API는 관리자 API와 이어지는 흐름을 고려해야 하므로, 문의 → 리드 → 프로젝트 연결, 서비스 허브 → 프로젝트/WBS 연결, 콘텐츠 공개 승인 → 결재 흐름 연결을 전제로 설계합니다.

---

# 3. ERP API 설계 원칙

## 3-1. 실행 단위 우선 원칙

ERP API는 아래 실행 단위 기준으로 나눕니다.

* 프로젝트
* WBS
* WBS 템플릿
* 아침 업무보고
* 퇴근 업무일지
* 결재
* 평가

## 3-2. WBS 중심 원칙

* 자유 텍스트 업무 저장 금지
* 업무보고 항목은 반드시 `wbs_task_id` 참조
* 업무일지 항목도 반드시 `wbs_task_id` 참조
* 프로젝트 진척도는 WBS 없이는 계산하지 않음

## 3-3. summary / detail 분리 원칙

모든 목록 API는 카드/테이블에 필요한 최소 필드만 제공합니다.

예시:

* 목록 API: 제목, 상태, 담당자, 기한, 진척률, 배지용 필드
* 상세 API: 본문, 의존성, 산출물, 이슈, 승인 이력, evidence, 첨부

이렇게 해야 외부/내부 반응형 UI에서 모바일 카드 뷰와 데스크톱 상세 뷰를 모두 안정적으로 구성할 수 있습니다.

## 3-4. 상태 전이 제한 원칙

상태값은 문자열 저장만 하지 않고 전이 가능한 경로를 제한합니다.

예시:

* `todo -> in_progress -> review -> approval_wait -> done`
* `blocked -> in_progress` 가능
* `done -> in_progress`는 제한적 재오픈만 허용
* `requires_approval=true`인 WBS는 `approval_wait` 없이 `done` 금지

## 3-5. 평가 근거 우선 원칙

평가는 아래 순서로 동작해야 합니다.

1. WBS / 산출물 / 결재 / 업무일지에서 evidence 수집
2. cycle 단위 evidence 집계
3. evaluator가 score 입력
4. finalizer가 finalize

즉, `score`보다 `evidence`가 먼저입니다.

## 3-6. 감사로그 우선 원칙

모든 ERP 쓰기 요청은 아래를 남겨야 합니다.

* `request_id`
* `actor_user_id`
* `target_type`
* `target_id`
* `action_type`
* `before_json`
* `after_json`
* `created_at`

## 3-7. 5단계 배포 완료 기준 반영 원칙

ERP API 문서는 4단계와 5단계 배포 완료 기준을 직접 만족해야 합니다.

* 4단계: 프로젝트/WBS, 아침 업무보고, 퇴근 업무일지, 뉴스/공지 운영, 발행 승인, 기본 전자결재, 감사 로그 일부
* 5단계: 평가 근거 데이터 집계, 권한 세분화, 보안 강화, Rate Limit, 구조화 로그, 테스트, 운영 체크리스트

즉 ERP API는 **WBS 참조 보고, 프로젝트 진척률 집계, 결재 플로우, 평가 근거 선행, 권한/로그/보안 강화**까지 포함해야 완성입니다.

---

# 4. 공통 규칙

## 4-1. 공통 응답 형식

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

## 4-2. 공통 오류 코드

* `VALIDATION_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT`
* `PRECONDITION_FAILED`
* `RATE_LIMITED`
* `INTERNAL_ERROR`

## 4-3. 공통 상태값 표준

* 프로젝트: `planned | active | blocked | on_hold | completed | cancelled`
* WBS: `todo | in_progress | review | approval_wait | blocked | done | delayed`
* 결재 문서: `draft | submitted | in_approval | approved | rejected | cancelled`
* 결재 액션: `approve | reject | request_changes`
* 평가 주기: `draft | open | scoring | finalized | closed`
* 사용자: `active | invited | suspended | retired`

## 4-4. 공통 헤더와 메타

권장 요청 헤더:

* `Content-Type: application/json`
* `X-Request-Id: <uuid>`
* `X-Locale: ko|en|ja|fr|es`

공통 응답 메타 예시:

```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": {
    "requestId": "req_01HQ...",
    "timestamp": "2026-03-29T15:00:00.000Z"
  }
}
```

## 4-5. 인증 원칙

* 세션은 HttpOnly cookie 저장 기본
* JWT payload는 `userId`, `roles`, `departmentId` 정도만 저장
* ERP API는 로그인 + 퍼미션 + 스코프 + 감사로그가 기본
* 민감정보는 Secrets 사용
* 일반 설정은 vars 사용

## 4-6. 도메인 / locale 공통 원칙

ERP API는 내부 실행 API지만, 외부 공개 링크를 payload나 evidence로 반환하는 경우 아래를 따릅니다.

* 공개 링크의 canonical host는 항상 `www.jinbizman.com`
* locale 관련 값은 `ko | en | ja | fr | es` 중 하나만 허용
* locale 미발행 콘텐츠는 링크를 내려주지 않음
* 다국어 콘텐츠 담당자의 업무는 WBS와 연결 가능

---

# 5. 역할, 스코프, 퍼미션

## 5-1. 기본 역할

* `super_admin`
* `executive_admin`
* `project_pm`
* `team_lead`
* `member`
* `finance_manager`
* `hr_evaluator`
* `viewer`

## 5-2. 스코프

* `global`
* `project`
* `team`
* `self`

ERP API에서는 주로 `project`, `team`, `self`를 사용합니다.

## 5-3. 퍼미션 코드 표준

* `project.read`
* `project.create`
* `project.update`
* `project.member.manage`
* `wbs.read`
* `wbs.create`
* `wbs.update`
* `wbs.approve`
* `wbs.template.read`
* `wbs.template.create`
* `daily_report.create`
* `daily_report.read`
* `daily_log.create`
* `daily_log.read`
* `daily_log.review`
* `approval.read`
* `approval.create`
* `approval.act`
* `evaluation.read`
* `evaluation.score`
* `evaluation.finalize`

## 5-4. 권한 원칙

* 프로젝트 데이터는 `project` scope 기준
* 팀장은 team scope에서 팀원 업무 검토 가능
* 일반 구성원은 self scope에서 본인 보고/일지/업무만 수정 가능
* 평가 finalize는 `hr_evaluator` 또는 제한된 관리자만 가능
* 감사로그는 수정/삭제 불가

---

# 6. 공통 타입 설계 기준

## 6-1. ProjectSummary

```ts
export interface ProjectSummary {
  id: number;
  code: string;
  name: string;
  projectType: string;
  status: "planned" | "active" | "blocked" | "on_hold" | "completed" | "cancelled";
  ownerUserId: number | null;
  startDate: string | null;
  endDate: string | null;
  progressRate: number;
  delayedTaskCount: number;
  updatedAt: string;
}
```

## 6-2. ProjectDetail

```ts
export interface ProjectDetail {
  id: number;
  code: string;
  name: string;
  projectType: string;
  serviceId: number | null;
  status: "planned" | "active" | "blocked" | "on_hold" | "completed" | "cancelled";
  ownerUserId: number | null;
  startDate: string | null;
  endDate: string | null;
  description: string;
  progressRate: number;
  delayedTaskCount: number;
  totalTaskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 6-3. WbsTaskSummary

```ts
export interface WbsTaskSummary {
  id: number;
  projectId: number;
  title: string;
  jobFamily: string;
  workStyle: string;
  assigneeUserId: number | null;
  status: "todo" | "in_progress" | "review" | "approval_wait" | "blocked" | "done" | "delayed";
  priority: string;
  plannedProgress: number;
  actualProgress: number;
  dueDate: string | null;
  requiresApproval: boolean;
  updatedAt: string;
}
```

## 6-4. WbsTaskDetail

```ts
export interface WbsTaskDetail {
  id: number;
  projectId: number;
  parentTaskId: number | null;
  templateId: number | null;
  title: string;
  description: string;
  taskType: string;
  jobFamily: string;
  workStyle: string;
  assigneeUserId: number | null;
  reviewerUserId: number | null;
  approverUserId: number | null;
  startDate: string | null;
  dueDate: string | null;
  plannedProgress: number;
  actualProgress: number;
  priority: string;
  status: "todo" | "in_progress" | "review" | "approval_wait" | "blocked" | "done" | "delayed";
  weight: number;
  requiresApproval: boolean;
  outputUrl: string | null;
  qaStatus: string | null;
  deployStatus: string | null;
  dependencyIds: number[];
  createdAt: string;
  updatedAt: string;
}
```

## 6-5. DailyReportSummary

```ts
export interface DailyReportSummary {
  id: number;
  userId: number;
  reportDate: string;
  projectId: number;
  itemCount: number;
  submittedAt: string;
}
```

## 6-6. DailyReportDetail

```ts
export interface DailyReportDetail {
  id: number;
  userId: number;
  reportDate: string;
  projectId: number;
  submittedAt: string;
  items: Array<{
    id: number;
    wbsTaskId: number;
    goalText: string;
    expectedHours: number;
    riskText: string;
    supportRequestText: string;
  }>;
}
```

## 6-7. DailyLogSummary

```ts
export interface DailyLogSummary {
  id: number;
  userId: number;
  logDate: string;
  projectId: number;
  itemCount: number;
  submittedAt: string;
}
```

## 6-8. DailyLogDetail

```ts
export interface DailyLogDetail {
  id: number;
  userId: number;
  logDate: string;
  projectId: number;
  submittedAt: string;
  items: Array<{
    id: number;
    wbsTaskId: number;
    workSummary: string;
    actualProgress: number;
    delayReasonCode: string;
    nextAction: string;
    outputUrl: string | null;
  }>;
}
```

## 6-9. ApprovalSummary

```ts
export interface ApprovalSummary {
  id: number;
  documentType: string;
  title: string;
  projectId: number | null;
  serviceId: number | null;
  requesterUserId: number;
  status: "draft" | "submitted" | "in_approval" | "approved" | "rejected" | "cancelled";
  createdAt: string;
}
```

## 6-10. ApprovalDetail

```ts
export interface ApprovalDetail {
  id: number;
  documentType: string;
  title: string;
  projectId: number | null;
  serviceId: number | null;
  requesterUserId: number;
  status: "draft" | "submitted" | "in_approval" | "approved" | "rejected" | "cancelled";
  payloadJson: Record<string, unknown>;
  lines: Array<{
    approverUserId: number;
    sequence: number;
    status: string;
  }>;
  actions: Array<{
    actionType: "approve" | "reject" | "request_changes";
    approverUserId: number;
    comment: string;
    actedAt: string;
  }>;
  createdAt: string;
}
```

## 6-11. EvaluationCycleSummary

```ts
export interface EvaluationCycleSummary {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "draft" | "open" | "scoring" | "finalized" | "closed";
}
```

## 6-12. EvaluationEvidenceSummary

```ts
export interface EvaluationEvidenceSummary {
  id: number;
  cycleId: number;
  userId: number;
  sourceType: "wbs" | "daily_log" | "approval" | "output" | "issue";
  sourceId: number;
  title: string;
  summaryText: string;
  createdAt: string;
}
```

---

# 7. ERP API 라우트 맵

## 7-1. ERP API 그룹

* `/api/erp/projects`
* `/api/erp/wbs`
* `/api/erp/wbs-templates`
* `/api/erp/daily-reports`
* `/api/erp/daily-logs`
* `/api/erp/approvals`
* `/api/erp/evaluations`

## 7-2. 실제 연결 파일 기준

* `worker/routes/erp/projects.ts`
* `worker/routes/erp/wbs.ts`
* `worker/routes/erp/wbs-templates.ts`
* `worker/routes/erp/daily-reports.ts`
* `worker/routes/erp/daily-logs.ts`
* `worker/routes/erp/approvals.ts`
* `worker/routes/erp/evaluations.ts`

---

# 8. 프로젝트 API

모든 일은 프로젝트에 속해야 하므로 ERP API의 시작점은 프로젝트입니다.

## 8-1. GET `/api/erp/projects`

### 목적

프로젝트 목록 조회

### 권한

* `project.read`

### 쿼리

* `status`
* `projectType`
* `ownerUserId`
* `q`
* `page`
* `pageSize`

### 응답 예시

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "code": "PRJ-2026-001",
        "name": "JINBIZ Main Launch",
        "projectType": "homepage_project",
        "status": "active",
        "ownerUserId": 7,
        "startDate": "2026-03-28",
        "endDate": "2026-05-15",
        "progressRate": 42,
        "delayedTaskCount": 3,
        "updatedAt": "2026-03-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 구현 규칙

* 목록 응답은 summary만 제공
* mobile card / desktop table 모두 같은 응답으로 렌더링 가능해야 함

## 8-2. POST `/api/erp/projects`

### 목적

프로젝트 생성

### 권한

* `project.create`

### 입력 예시

```json
{
  "code": "PRJ-2026-002",
  "name": "Eureka World Internal Rollout",
  "projectType": "platform_project",
  "serviceId": 2,
  "ownerUserId": 11,
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "description": "유레카월드 내부 롤아웃 프로젝트"
}
```

### 검증 규칙

* `code` unique
* `name` 필수
* `projectType` 필수
* 종료일은 시작일보다 빠를 수 없음

## 8-3. GET `/api/erp/projects/:id`

### 목적

프로젝트 상세 조회

### 권한

* `project.read`

### 응답 특징

* summary + 설명 + 진척률 + 지연 WBS 수 + 멤버 수 + 주요 지표 포함
* WBS 상세 payload는 별도 WBS API에서 조회

## 8-4. PATCH `/api/erp/projects/:id`

### 목적

프로젝트 수정

### 권한

* `project.update`

### 수정 가능 필드 예시

* `name`
* `status`
* `ownerUserId`
* `startDate`
* `endDate`
* `description`

## 8-5. GET `/api/erp/projects/:id/members`

### 목적

프로젝트 멤버 조회

### 권한

* `project.read`

## 8-6. POST `/api/erp/projects/:id/members`

### 목적

프로젝트 멤버 추가

### 권한

* `project.member.manage`

### 입력 예시

```json
{
  "userId": 21,
  "roleInProject": "frontend"
}
```

---

# 9. WBS API

WBS는 ERP의 핵심 엔진입니다. 자유 텍스트가 아니라 구조화된 업무 단위로 관리해야 합니다.

## 9-1. GET `/api/erp/wbs`

### 목적

WBS 목록 조회

### 권한

* `wbs.read`

### 쿼리

* `projectId`
* `status`
* `assigneeUserId`
* `jobFamily`
* `workStyle`
* `q`
* `page`
* `pageSize`

### 응답 특징

* 카드/칸반/테이블 공용 summary 제공
* `status`, `priority`, `dueDate`, `actualProgress` 중심

## 9-2. POST `/api/erp/wbs`

### 목적

WBS 생성

### 권한

* `wbs.create`

### 입력 예시

```json
{
  "projectId": 1,
  "templateId": 3,
  "title": "홈 메인 Hero 구현",
  "description": "메인 히어로 섹션 UI 및 다국어 반영",
  "assigneeUserId": 21,
  "reviewerUserId": 7,
  "approverUserId": 3,
  "dueDate": "2026-04-05",
  "priority": "high",
  "requiresApproval": true,
  "weight": 8
}
```

### 검증 규칙

* `projectId` 필수
* `assigneeUserId` 필수
* `weight` 0 초과
* `requiresApproval=true`면 approver 존재 권장

### 처리 규칙

* template 선택 시 기본 schema 및 초기 단계 반영 가능
* 상태 기본값은 `todo`

## 9-3. GET `/api/erp/wbs/:id`

### 목적

WBS 상세 조회

### 권한

* `wbs.read`

### 응답 특징

* 본문, 의존성, 산출물, 승인 필요 여부, reviewer/approver, 이력 포함

## 9-4. PATCH `/api/erp/wbs/:id`

### 목적

WBS 수정

### 권한

* `wbs.update`

### 수정 가능 필드 예시

* `title`
* `description`
* `status`
* `assigneeUserId`
* `reviewerUserId`
* `approverUserId`
* `dueDate`
* `priority`
* `plannedProgress`
* `actualProgress`
* `outputUrl`

### 사전조건

* `actualProgress`는 0~100
* `plannedProgress`는 0~100
* `requiresApproval=true`인 경우 승인 전 `done` 금지
* `blocked` 상태 전환 시 지연/차단 사유 코드 기록 권장

## 9-5. POST `/api/erp/wbs/:id/dependencies`

### 목적

WBS 의존성 추가

### 권한

* `wbs.update`

### 입력 예시

```json
{
  "dependsOnTaskId": 14,
  "dependencyType": "finish_to_start"
}
```

### 검증 규칙

* 자기 자신 의존 금지
* 순환 참조 금지

---

# 10. WBS 템플릿 API

WBS는 하나의 고정 양식이 아니라 직무·직군·업무유형별 템플릿으로 생성되어야 합니다.

## 10-1. GET `/api/erp/wbs-templates`

### 목적

WBS 템플릿 목록 조회

### 권한

* `wbs.template.read`

### 쿼리

* `jobFamily`
* `workStyle`
* `isActive`

## 10-2. POST `/api/erp/wbs-templates`

### 목적

WBS 템플릿 생성

### 권한

* `wbs.template.create`

### 입력 예시

```json
{
  "code": "FE_DEV_BASE",
  "name": "프론트엔드 기본 템플릿",
  "jobFamily": "frontend",
  "workStyle": "FE_DEV",
  "isActive": true,
  "schemaJson": {
    "steps": [
      "요구사항 확인",
      "구현",
      "리뷰",
      "QA",
      "배포 확인"
    ]
  }
}
```

### 처리 규칙

* `code` unique
* `jobFamily`, `workStyle` 필수
* 이후 WBS 생성 시 기본 단계로 연결 가능

## 10-3. GET `/api/erp/wbs-templates/:id`

### 목적

WBS 템플릿 상세 조회

### 권한

* `wbs.template.read`

## 10-4. PATCH `/api/erp/wbs-templates/:id`

### 목적

WBS 템플릿 수정

### 권한

* `wbs.template.create` 또는 제한된 관리자 권한

---

# 11. 아침 업무보고 API

아침 업무보고는 오늘 수행할 WBS와 목표를 등록하는 기능입니다.

## 11-1. GET `/api/erp/daily-reports`

### 목적

업무보고 목록 조회

### 권한

* `daily_report.read`

### 쿼리

* `userId`
* `projectId`
* `reportDate`
* `page`
* `pageSize`

## 11-2. GET `/api/erp/daily-reports/:id`

### 목적

업무보고 상세 조회

### 권한

* `daily_report.read`

## 11-3. POST `/api/erp/daily-reports`

### 목적

아침 업무보고 제출

### 권한

* `daily_report.create`

### 입력 예시

```json
{
  "reportDate": "2026-03-29",
  "projectId": 1,
  "items": [
    {
      "wbsTaskId": 32,
      "goalText": "히어로 반응형 마무리",
      "expectedHours": 4,
      "riskText": "문구 검수 지연 가능성",
      "supportRequestText": "디자인 시안 최종본 필요"
    }
  ]
}
```

### 검증 규칙

* items 최소 1개
* 모든 item은 `wbsTaskId` 필수
* `expectedHours` 0~24
* 동일 유저/동일 날짜/동일 프로젝트 중복 정책 제한 가능

### 핵심 규칙

* WBS 없는 업무보고 금지
* 리스크와 지원 요청은 분리 저장
* 추후 대시보드 제출률 계산 가능해야 함

---

# 12. 퇴근 업무일지 API

퇴근 업무일지는 실제 수행 결과와 진척률을 기록하는 기능입니다.

## 12-1. GET `/api/erp/daily-logs`

### 목적

업무일지 목록 조회

### 권한

* `daily_log.read`

### 쿼리

* `userId`
* `projectId`
* `logDate`
* `page`
* `pageSize`

## 12-2. GET `/api/erp/daily-logs/:id`

### 목적

업무일지 상세 조회

### 권한

* `daily_log.read`

## 12-3. POST `/api/erp/daily-logs`

### 목적

퇴근 업무일지 제출

### 권한

* `daily_log.create`

### 입력 예시

```json
{
  "logDate": "2026-03-29",
  "projectId": 1,
  "items": [
    {
      "wbsTaskId": 32,
      "workSummary": "히어로 모바일/태블릿 레이아웃 정리 완료",
      "actualProgress": 80,
      "delayReasonCode": "",
      "nextAction": "문구 검수 반영 후 QA",
      "outputUrl": "https://www.jinbizman.com/admin/preview/hero"
    }
  ]
}
```

### 검증 규칙

* items 최소 1개
* 모든 item은 `wbsTaskId` 필수
* `actualProgress` 0~100
* 지연 상태면 지연 사유 코드 필요

### 핵심 규칙

* WBS 연결 필수
* 실제 진척도는 통계에 바로 반영 가능해야 함
* 산출물 URL 또는 첨부 연결 가능해야 함

---

# 13. 결재 API

결재는 ERP 통제 축의 핵심입니다. 게시 승인, 일정 변경 승인, 예산 승인 같은 운영 흐름을 묶습니다.

## 13-1. GET `/api/erp/approvals`

### 목적

결재 문서 목록 조회

### 권한

* `approval.read`

### 쿼리

* `status`
* `documentType`
* `requesterUserId`
* `projectId`
* `page`
* `pageSize`

## 13-2. GET `/api/erp/approvals/:id`

### 목적

결재 문서 상세 조회

### 권한

* `approval.read`

## 13-3. POST `/api/erp/approvals`

### 목적

결재 문서 생성

### 권한

* `approval.create`

### 입력 예시

```json
{
  "documentType": "wbs_deadline_extension",
  "title": "홈페이지 런칭 WBS 일정 연장 요청",
  "projectId": 1,
  "serviceId": 1,
  "payloadJson": {
    "wbsTaskId": 32,
    "fromDueDate": "2026-04-05",
    "toDueDate": "2026-04-08",
    "reason": "문구 검수 지연"
  }
}
```

### 검증 규칙

* `documentType` 필수
* `title` 필수
* payload는 문서 타입별 schema 검증 필요

## 13-4. POST `/api/erp/approvals/:id/actions`

### 목적

결재 액션 처리

### 권한

* `approval.act`

### 입력 예시

```json
{
  "actionType": "approve",
  "comment": "연장 승인"
}
```

### 상태 전이 규칙

* `submitted -> in_approval -> approved/rejected`
* 승인선 없는 직접 승인 금지
* 이미 종료된 문서 재액션 금지

---

# 14. 평가 API

평가는 evidence 수집이 먼저이고 점수 입력이 나중입니다.

## 14-1. GET `/api/erp/evaluations/cycles`

### 목적

평가 주기 목록 조회

### 권한

* `evaluation.read`

## 14-2. GET `/api/erp/evaluations/cycles/:id`

### 목적

평가 주기 상세 조회

### 권한

* `evaluation.read`

## 14-3. POST `/api/erp/evaluations/cycles`

### 목적

평가 주기 생성

### 권한

* 제한된 `evaluation.finalize` 또는 관리 권한

### 입력 예시

```json
{
  "name": "2026 Q2 평가",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "status": "draft"
}
```

## 14-4. GET `/api/erp/evaluations/evidences`

### 목적

평가 근거 데이터 조회

### 권한

* `evaluation.read`

### 쿼리

* `cycleId`
* `userId`
* `sourceType`
* `page`
* `pageSize`

### 응답 특징

* WBS, 산출물, 결재, 업무일지 등 evidence source를 함께 제공
* 점수 입력 전 검토용 summary 제공

## 14-5. POST `/api/erp/evaluations/scores`

### 목적

평가 점수 입력

### 권한

* `evaluation.score`

### 입력 예시

```json
{
  "cycleId": 3,
  "evaluateeUserId": 21,
  "evaluationItemId": 4,
  "score": 4.5,
  "comment": "일정 준수와 협업이 안정적이었음"
}
```

### 사전조건

* 해당 cycle 존재
* evidence 존재 여부 확인
* evaluator 권한 확인

## 14-6. POST `/api/erp/evaluations/finalize`

### 목적

평가 최종 확정

### 권한

* `evaluation.finalize`

### 입력 예시

```json
{
  "cycleId": 3
}
```

### 사전조건

* cycle status가 `scoring`
* 필수 평가 항목 점수 입력 완료
* finalize 후 수정 제한
* evidence 없는 사용자 확정 차단

---

# 15. 상태 전이 규칙

ERP API는 상태 문자열만 저장하지 않고, 허용 가능한 전이를 제한합니다.

## 15-1. 프로젝트 상태 전이

* `planned -> active`
* `active -> blocked`
* `active -> on_hold`
* `active -> completed`
* `blocked -> active`
* `on_hold -> active`
* `planned -> cancelled`
* `active -> cancelled`

## 15-2. WBS 상태 전이

* `todo -> in_progress`
* `in_progress -> review`
* `review -> approval_wait`
* `review -> done` (`requiresApproval=false`인 경우만)
* `approval_wait -> done`
* `blocked -> in_progress`
* `in_progress -> delayed`
* `delayed -> in_progress`

## 15-3. 결재 상태 전이

* `draft -> submitted`
* `submitted -> in_approval`
* `in_approval -> approved`
* `in_approval -> rejected`
* `draft -> cancelled`
* `submitted -> cancelled` (제한적)

## 15-4. 평가 주기 상태 전이

* `draft -> open`
* `open -> scoring`
* `scoring -> finalized`
* `finalized -> closed`

잘못된 전이는 모두 `PRECONDITION_FAILED` 처리합니다.

---

# 16. Evidence 모델 표준

평가는 감으로 하지 않고 데이터로 해야 하므로 evidence source를 표준화합니다.

## 16-1. sourceType 표준

* `wbs`
* `daily_log`
* `approval`
* `output`
* `issue`

## 16-2. evidence 최소 필드

* `cycle_id`
* `user_id`
* `source_type`
* `source_id`
* `summary_json`
* `created_at`

## 16-3. evidence 생성 기준 예시

* WBS가 `done` 처리되면 evidence 후보 생성
* 일지에 산출물 링크가 들어오면 evidence 후보 생성
* 승인 완료된 결재 문서가 있으면 evidence 후보 생성
* 주요 이슈 해결 기록이 있으면 evidence 후보 생성

---

# 17. 페이징, 필터, 정렬 표준

## 17-1. 공통 쿼리 파라미터

* `page`
* `pageSize`
* `q`
* `sortBy`
* `sortOrder`

## 17-2. 공통 응답 형태

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    },
    "filters": {
      "statusOptions": ["planned", "active", "blocked", "on_hold", "completed", "cancelled"]
    }
  }
}
```

## 17-3. 정렬 기본값

* 프로젝트 목록: `updatedAt desc`
* WBS 목록: `dueDate asc`, 보조 `updatedAt desc`
* 업무보고/일지 목록: `submittedAt desc`
* 결재 목록: `createdAt desc`
* 평가 주기 목록: `startDate desc`

---

# 18. ERP API와 반응형 UI 연결 규칙

반응형은 CSS만으로 해결되지 않습니다. ERP API는 모바일 카드형, 태블릿 요약형, 데스크톱 상세형 UI를 동시에 지원할 수 있도록 설계해야 합니다.

## 18-1. 목록 API 설계 규칙

* 카드/테이블 공통 필드 제공
* 상태, 제목, 담당자, 기한, 진척률, 배지 필드 제공
* 상세 본문/이력/evidence는 목록에서 제외

## 18-2. 상세 API 설계 규칙

* 상세 drawer/page에서 필요한 full payload만 제공
* 의존성, 산출물, 승인, 변경 이력, evidence 데이터를 포함

## 18-3. 관리자 주요 화면에 필요한 응답 연결

* `ProjectsPage` → `ProjectSummary`, `ProjectDetail`
* `WbsBoardPage` → `WbsTaskSummary`, `WbsTaskDetail`
* `DailyReportPage` → report summary + item detail
* `DailyLogPage` → log summary + item detail
* `ApprovalsPage` → `ApprovalSummary`, `ApprovalDetail`
* `EvaluationsPage` → cycle summary + evidence summary

---

# 19. 보안, Rate Limit, Queue, 관측성

## 19-1. 보안 기준

* ERP API는 로그인된 사용자만 접근
* JWT/HttpOnly cookie 사용
* 비밀정보 하드코딩 금지
* `JWT_SECRET`, `DATABASE_URL`, 이메일 API 키는 Secrets 관리
* 모든 쓰기 요청은 감사로그 필수

## 19-2. Rate Limit 기준

* `/api/erp/*`에 사용자 기준 기본 제한
* 대량 점수 입력, 대량 상태 변경, 대량 결재 액션에는 stricter rule 가능

## 19-3. Queue 분리 기준

* 알림 발송
* 결재 후 후속 통지
* 일일 요약 집계
* 평가 집계 후 후처리
* 감사로그 후처리

## 19-4. 구조화 로그 기준

* `request_id`
* `user_id`
* `project_id`
* `wbs_task_id`
* `action_type`
* `status_code`
* `error_code`
* `duration_ms`

---

# 20. 테스트 기준

## 20-1. 1차 필수 테스트

* 권한 없는 프로젝트 생성 차단
* 프로젝트 코드 중복 차단
* WBS 없는 업무보고 차단
* 업무일지 `actualProgress` 범위 검증
* `requiresApproval=true` WBS의 직접 `done` 차단
* 순환 의존성 차단
* 결재 종료 문서 재액션 차단
* evidence 없는 평가 점수 입력 차단
* finalize 권한 분리 확인
* summary/detail 응답 분리 확인

## 20-2. 권장 테스트 레벨

* 단위 테스트: validator, permission checker, status transition helper
* 통합 테스트: erp routes + DB mock
* Workers runtime 테스트: Hono route + middleware + env bindings

---

# 21. 구현 우선순위

## 21-1. 추천 구현 순서

1. 공통 `response.ts`, `errors.ts`, `request-id`, `auth`, `require-permission`
2. `projects.ts`
3. `wbs.ts`
4. `wbs-templates.ts`
5. `daily-reports.ts`
6. `daily-logs.ts`
7. `approvals.ts`
8. `evaluations.ts`
9. 감사로그/Queue/Rate Limit 강화
10. OpenAPI 문서화
11. 관리자 UI 연결

## 21-2. 5단계 배포 완료 기준과의 연결

### 1단계
* 프로젝트 / WBS 기본 골격

### 2단계
* WBS 템플릿, 업무보고, 업무일지 기본 운영

### 3단계
* 결재 기본 흐름

### 4단계
* 뉴스/공지 승인과 연결 가능한 결재 구조, 감사로그 일부, 관리자 운영 흐름 완성
* 모든 업무보고/일지가 WBS를 참조
* 프로젝트 진척률 자동 집계 시작

### 5단계
* 평가 evidence 조회, 점수 입력, finalize 차단 규칙, 보안/테스트/운영 기준 강화
* 평가 점수 전에 근거 데이터가 조회 가능
* 권한별 메뉴/데이터 접근 분리
* 핵심 WBS 시나리오 테스트 통과

---

# 22. 문서 교체용 최종 체크리스트

## 22-1. 이 문서가 기존 `erp-api.md`를 즉시 대체할 수 있어야 하는 이유

* ERP API 범위를 프로젝트, WBS, WBS 템플릿, 업무보고, 업무일지, 결재, 평가로 분리했습니다.
* 공통 응답 형식, 오류 코드, 상태값 표준, 퍼미션 코드, 스코프를 포함했습니다.
* 프로젝트/WBS 중심 운영 규칙과 WBS 없는 보고 금지 규칙을 포함했습니다.
* 반응형 웹앱을 가능하게 하는 summary/detail 응답 구조를 포함했습니다.
* 결재와 평가를 evidence 중심 흐름으로 정리했습니다.
* 감사로그, Queue, Rate Limit, 테스트 기준을 포함했습니다.
* 기존 문서들에서 반복되는 핵심 원칙인 WBS 중심 운영, 업무보고/일지 연결, 평가 근거 데이터화, 권한 분리를 누락 없이 묶었습니다.
* 기존 초안에는 없었던 `daily-reports/:id`, `daily-logs/:id`, `approvals/:id`, `evaluation cycle detail` 등 summary/detail 대응 엔드포인트를 추가해 실제 프론트 연결성을 높였습니다.

## 22-2. 최종 검수 체크리스트

### 프로젝트
* 프로젝트 목록/상세 가능
* 멤버 조회/추가 가능
* 상태/기간 수정 가능

### WBS
* WBS 목록/생성/수정 가능
* 의존성 추가 가능
* approval_wait 규칙 존재
* actual/planned progress 범위 검증 가능

### WBS 템플릿
* 직무·직군·업무유형별 템플릿 조회/생성/상세 가능

### 업무보고/업무일지
* WBS 연결 필수
* 제출 목록/상세 조회 가능
* 실제 진척률 반영 가능
* 지연 사유/다음 액션 저장 가능

### 결재
* 문서 목록/상세/생성 가능
* 승인/반려/수정요청 액션 가능
* 종료 문서 보호 가능

### 평가
* cycle 조회/생성/상세 가능
* evidence 조회 가능
* score 입력 가능
* finalize 권한 분리 가능
* evidence 없는 finalize 차단 가능

### 보안/운영
* HttpOnly cookie 기반 인증
* permission + scope 검사
* audit 로그 생성
* summary/detail 구조 유지
* 5단계 배포 완료 기준 반영

---

## 변경 요약

* `docs/api/erp-api.md`를 **실행 중심 ERP API 문서**로 재정의했습니다.
* ERP API 범위를 `/api/erp/*` 기준으로 명확히 분리했습니다.
* 프로젝트, WBS, WBS 템플릿, 업무보고, 업무일지, 결재, 평가 명세를 포함했습니다.
* WBS 없는 업무보고/업무일지 금지 규칙을 반영했습니다.
* 평가 점수보다 evidence가 먼저라는 구조를 반영했습니다.
* 반응형 웹앱을 가능하게 하는 summary/detail 응답 원칙을 반영했습니다.
* 권한, 스코프, 감사로그, Rate Limit, Queue, 테스트 기준을 포함했습니다.
* 기존 초안에는 없었던 상세 조회 엔드포인트와 상태 전이 규칙, evidence source 표준을 추가해 구현 착수성을 높였습니다.

---

## 다음 단계

가장 자연스러운 다음 작업은 **이 문서를 기준으로 `worker/routes/erp/*.ts` 실제 코드 골격과 `src/lib/types.ts` ERP 응답 타입 세트를 바로 생성하는 것**입니다.
