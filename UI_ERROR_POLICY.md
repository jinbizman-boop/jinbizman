# JINBIZ MANAGEMENT Admin UI Error Policy

## Purpose

This policy fixes the Admin/ERP UI response to API error classes without changing Backend authorization. Server-side authentication, permission, and scope checks remain the final security boundary.

## Status Handling

| Status | UI Treatment | Notes |
|---|---|---|
| 401 | Redirect to `/admin/login`. | Used for missing, expired, or invalid session. |
| 403 | Show common Forbidden UI for page-load failures; show action-level permission feedback for button/form failures. | Must not be shown as empty data or generic 500. |
| 404 | Show target-not-found or module-not-found error state. | Different from Forbidden. |
| 409 | Keep the page context and show conflict/state message near the attempted action. | Used for business state conflicts. |
| 429 | Keep the page context and show rate-limit message. | Retry guidance should come from API message/headers. |
| 500 | Show generic system error state without stack, SQL, or secrets. | No internal details in UI. |
| network error | Show generic connectivity error state. | User can retry from the same page. |

## Page-Level Contract

- Initial data fetch returns 401: login redirect.
- Initial data fetch returns 403: `ForbiddenState`.
- Initial data fetch returns 404/500/network error: `StatePanel kind="error"`.
- Empty result with successful 200: `StatePanel kind="empty"`.

## Action-Level Contract

- Action returns 401: login redirect.
- Action returns 403: inline/status notice with `이 작업을 수행할 권한이 없습니다.`
- Action returns 409/429/500: keep current page state and show the API message when safe.

## Accessibility / Responsive Baseline

- Forbidden UI uses an alert semantic through the common state panel.
- Forbidden UI has a heading and keyboard-focusable buttons.
- Actions are arranged with wrapping controls so the state remains usable from 360px mobile widths through desktop.
