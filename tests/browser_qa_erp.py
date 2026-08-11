from __future__ import annotations

import functools
import http.server
import json
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "ERP_SCREEN_MANIFEST.json").read_text(encoding="utf-8"))
ERP_URLS = ["/" + screen["file"] for group in MANIFEST["groups"] for screen in group["screens"]]
REPRESENTATIVE = [
    "/admin/dashboard.html",
    "/admin/services.html",
    "/admin/site-page-editor.html",
    "/admin/news-editor.html",
    "/admin/inquiries.html",
    "/admin/project-detail.html",
    "/admin/wbs-board.html",
    "/admin/wbs-gantt.html",
    "/admin/daily-report.html",
    "/admin/approval-detail.html",
    "/admin/users.html",
    "/admin/attendance.html",
    "/admin/budget-dashboard.html",
    "/admin/ai-assistant.html",
    "/admin/evaluation-scores.html",
    "/admin/screen-map.html",
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def start_server() -> tuple[http.server.ThreadingHTTPServer, str]:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def inspect_page(context, base: str, path: str, viewport: str) -> dict:
    page = context.new_page()
    console_errors: list[str] = []
    page_errors: list[str] = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: page_errors.append(str(exc)))
    try:
        response = page.goto(base + path, wait_until="domcontentloaded", timeout=10000)
        metrics = page.evaluate("""() => ({
          bodyScroll: document.body.scrollWidth,
          bodyClient: document.documentElement.clientWidth,
          title: document.title,
          h1: document.querySelector('h1')?.textContent?.trim() || '',
          images: [...document.images].map(img => ({src: img.getAttribute('src'), ok: img.complete && img.naturalWidth > 0}))
        })""")
        broken_images = [item["src"] for item in metrics["images"] if not item["ok"]]
        return {
            "path": path,
            "viewport": viewport,
            "status": response.status if response else None,
            "title": metrics["title"],
            "h1": metrics["h1"],
            "horizontal_overflow": max(0, metrics["bodyScroll"] - metrics["bodyClient"]),
            "broken_images": broken_images,
            "console_errors": console_errors,
            "page_errors": page_errors,
        }
    except Exception as exc:
        return {
            "path": path, "viewport": viewport, "status": None, "title": "", "h1": "",
            "horizontal_overflow": -1, "broken_images": [], "console_errors": console_errors,
            "page_errors": page_errors + [repr(exc)],
        }
    finally:
        page.close()


def main() -> int:
    server, base = start_server()
    results: dict = {"all_desktop": [], "responsive": [], "interactions": {}, "errors": []}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, executable_path="/usr/bin/chromium", args=["--no-sandbox"])

            desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
            desktop.set_default_timeout(5000)
            for path in ERP_URLS:
                results["all_desktop"].append(inspect_page(desktop, base, path, "1440x1000"))
            desktop.close()

            for size, name in [({"width": 820, "height": 1100}, "820x1100"), ({"width": 390, "height": 844}, "390x844")]:
                ctx = browser.new_context(viewport=size)
                ctx.set_default_timeout(5000)
                for path in REPRESENTATIVE:
                    results["responsive"].append(inspect_page(ctx, base, path, name))
                ctx.close()

            # Functional interaction scenarios
            ctx = browser.new_context(viewport={"width": 390, "height": 844})
            ctx.set_default_timeout(5000)
            page = ctx.new_page()
            def erp_api_route(route):
                url = route.request.url
                if "/api/auth/login" in url:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": {"user": {"id": 1, "name": "QA 관리자", "email": "qa@jinbizman.com", "roles": ["super_admin"], "permissions": ["*"]}}}))
                elif "/api/auth/me" in url:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": {"id": 1, "name": "QA 관리자", "email": "qa@jinbizman.com", "roles": ["super_admin"], "permissions": ["*"]}}))
                elif "/api/health" in url:
                    route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": {"status": "ok", "database": "connected"}}))
                else:
                    route.continue_()
            page.route("**/api/**", erp_api_route)
            page.goto(base + "/admin/login.html", wait_until="domcontentloaded")
            page.fill("input[type=email]", "qa@jinbizman.com")
            page.fill("input[type=password]", "browser-qa-password")
            page.click("button[type=submit]")
            page.wait_for_url("**/admin/dashboard.html")
            results["interactions"]["login_redirect"] = page.url.endswith("/admin/dashboard.html")

            page.click("[data-action=open-sidebar]")
            results["interactions"]["mobile_sidebar_open"] = page.locator("#erp-sidebar").evaluate("el => el.classList.contains('open')")
            page.click("[data-action=close-sidebar]")

            page.keyboard.press("Control+K")
            page.fill("#command-input", "평가 근거")
            results["interactions"]["command_search_results"] = page.locator(".erp-command-item:visible").count()
            page.keyboard.press("Escape")
            page.close()
            ctx.close()

            ctx = browser.new_context(viewport={"width": 1440, "height": 1000})
            ctx.set_default_timeout(5000)
            page = ctx.new_page()

            page.goto(base + "/admin/wbs-board.html", wait_until="domcontentloaded")
            source = page.locator("[data-task-id='todo-0']")
            target = page.locator("[data-kanban-lane='in_progress'] .erp-kanban-body")
            source.drag_to(target)
            results["interactions"]["kanban_moved"] = target.locator("[data-task-id='todo-0']").count() == 1

            page.goto(base + "/admin/daily-report.html", wait_until="domcontentloaded")
            before = page.locator(".daily-item").count()
            page.click("[data-action=add-daily-item]")
            results["interactions"]["daily_item_added"] = page.locator(".daily-item").count() == before + 1

            attendance_calls: list[str] = []
            def attendance_route(route):
                attendance_calls.append(route.request.method)
                route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": {"id": 1, "work_date": "2026-08-09", "status": "working"}}))
            page.route("**/api/erp/attendance/punch", attendance_route)
            page.goto(base + "/admin/attendance.html", wait_until="domcontentloaded")
            page.click("[data-action=attendance-punch]")
            page.wait_for_timeout(120)
            results["interactions"]["attendance_api_called"] = attendance_calls == ["POST"]

            page.goto(base + "/admin/receipts-ocr.html", wait_until="domcontentloaded")
            page.click("[data-action=ocr-select]")
            results["interactions"]["ocr_fails_closed"] = page.locator(".erp-toast.error").count() == 1

            page.goto(base + "/admin/ai-assistant.html", wait_until="domcontentloaded")
            page.fill("#chat-input", "다국어 콘텐츠 발행 순서는?")
            page.click("#chat-form button[type=submit]")
            results["interactions"]["ai_fails_closed"] = page.locator(".erp-toast.error").count() == 1

            page.goto(base + "/admin/evaluation-scores.html", wait_until="domcontentloaded")
            first_range = page.locator("[data-score-range]").first
            first_range.evaluate("(el) => { el.value = 95; el.dispatchEvent(new Event('input', {bubbles:true})); }")
            results["interactions"]["score_updated"] = first_range.locator("xpath=following-sibling::output").inner_text() == "95"

            page.goto(base + "/admin/approval-detail.html", wait_until="domcontentloaded")
            page.click("[data-action=approve]")
            results["interactions"]["approval_toast"] = page.locator(".erp-toast.success").count() == 1
            page.close()
            ctx.close()
            browser.close()
    except Exception as exc:
        results["errors"].append(repr(exc))
    finally:
        server.shutdown()
        server.server_close()

    all_records = results["all_desktop"] + results["responsive"]
    for record in all_records:
        if (
            record["status"] != 200
            or not record["h1"]
            or record["horizontal_overflow"] > 2
            or record["broken_images"]
            or record["console_errors"]
            or record["page_errors"]
        ):
            results["errors"].append(record)
    for key, value in results["interactions"].items():
        if value is False or value == 0:
            results["errors"].append({"interaction": key, "value": value})

    output = ROOT / "browser-qa-erp.json"
    output.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    summary = {
        "desktop_pages": len(results["all_desktop"]),
        "responsive_cases": len(results["responsive"]),
        "interactions": results["interactions"],
        "errors": len(results["errors"]),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if results["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
