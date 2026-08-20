#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "[1/6] Node.js 확인"
node --version
npm --version

echo "[2/6] 의존성 설치"
npm ci

echo "[3/6] Chromium 설치"
npx playwright install chromium

echo "[4/6] 타입·테스트·빌드 검증"
npm run typecheck
npm test
npm run build

echo "[5/6] Desktop 1440 / Tablet 768 / Mobile 390 전체 화면 캡처"
QA_ALLOW_ISSUES=1 node scripts/capture-visual-qa.mjs --serve

echo "[6/6] 결과 위치"
echo "$(pwd)/qa-artifacts/visual-qa-summary.md"
echo "$(pwd)/qa-artifacts/screenshots"
