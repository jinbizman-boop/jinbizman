@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [1/6] Node.js 확인
where node >nul 2>&1 || (echo Node.js 20.19 이상을 먼저 설치하세요. & exit /b 1)
where npm >nul 2>&1 || (echo npm을 찾을 수 없습니다. & exit /b 1)

echo [2/6] 의존성 설치
call npm ci || exit /b 1

echo [3/6] Chromium 설치
call npx playwright install chromium || exit /b 1

echo [4/6] 타입·테스트·빌드 검증
call npm run typecheck || exit /b 1
call npm test || exit /b 1
call npm run build || exit /b 1

echo [5/6] Desktop 1440 / Tablet 768 / Mobile 390 전체 화면 캡처
set QA_ALLOW_ISSUES=1
call node scripts\capture-visual-qa.mjs --serve
set QA_RESULT=%ERRORLEVEL%

echo [6/6] 결과 위치
echo %CD%\qa-artifacts\visual-qa-summary.md
echo %CD%\qa-artifacts\screenshots

if not "%QA_RESULT%"=="0" (
  echo 시각 QA에서 확인할 항목이 발견되었습니다. summary 파일을 확인하세요.
  exit /b %QA_RESULT%
)

echo 모든 자동 검증 절차가 종료되었습니다.
exit /b 0
