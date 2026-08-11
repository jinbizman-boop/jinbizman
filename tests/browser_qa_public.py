from __future__ import annotations

import functools
import http.server
import json
import threading
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def active_public_urls() -> list[str]:
    urls: list[str] = []
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(("admin/", "dist/", "docs/", "qa-results/", "source-files/")):
            continue
        # The integrated preview intentionally loads many iframes and is covered by static link tests.
        if rel == "all-screens-preview.html":
            continue
        urls.append("/" + rel)
    return urls


REPRESENTATIVE = [
    "/index.html",
    "/pages/company.html",
    "/pages/business.html",
    "/pages/newsletter.html",
    "/pages/contact.html",
    "/pages/projects/eureka-world.html",
    "/pages/projects/new-retro-games.html",
    "/pages/projects/salary-captive.html",
    "/pages/projects/all-evaluations.html",
    "/pages/news/notice/official-website-renewal.html",
    "/pages/news/disclosure/domain-and-language-policy.html",
    "/en/index.html",
    "/en/projects/eureka-world.html",
    "/ja/business.html",
    "/fr/contact.html",
    "/es/newsletter.html",
    "/portal.html",
    "/components/component-library.html",
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


class DaemonThreadingHTTPServer(http.server.ThreadingHTTPServer):
    daemon_threads = True


def start_server() -> tuple[DaemonThreadingHTTPServer, str]:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = DaemonThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def attach_error_state(page: Page) -> dict[str, list[str]]:
    state: dict[str, list[str]] = {"console": [], "page": []}
    page.on("console", lambda msg: state["console"].append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: state["page"].append(str(exc)))
    return state


def inspect_page(page: Page, state: dict[str, list[str]], base: str, path: str, viewport: str) -> dict:
    state["console"].clear()
    state["page"].clear()
    try:
        response = page.goto(base + path, wait_until="domcontentloaded", timeout=10000)
        page.wait_for_timeout(60)
        metrics = page.evaluate(
            """() => ({
              bodyScroll: document.body.scrollWidth,
              bodyClient: document.documentElement.clientWidth,
              title: document.title,
              h1: document.querySelector('h1')?.textContent?.trim() || '',
              images: [...document.images].map(img => ({
                src: img.getAttribute('src'),
                ok: img.complete && img.naturalWidth > 0
              }))
            })"""
        )
        return {
            "path": path,
            "viewport": viewport,
            "status": response.status if response else None,
            "title": metrics["title"],
            "h1": metrics["h1"],
            "horizontal_overflow": max(0, metrics["bodyScroll"] - metrics["bodyClient"]),
            "broken_images": [item["src"] for item in metrics["images"] if not item["ok"]],
            "console_errors": list(state["console"]),
            "page_errors": list(state["page"]),
        }
    except Exception as exc:
        return {
            "path": path,
            "viewport": viewport,
            "status": None,
            "title": "",
            "h1": "",
            "horizontal_overflow": -1,
            "broken_images": [],
            "console_errors": list(state["console"]),
            "page_errors": list(state["page"]) + [repr(exc)],
        }


def main() -> int:
    server, base = start_server()
    results: dict = {"all_desktop": [], "responsive": [], "interactions": {}, "errors": []}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                executable_path="/usr/bin/chromium",
                args=["--no-sandbox", "--disable-background-networking"],
            )

            desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
            desktop.set_default_timeout(7000)
            page = desktop.new_page()
            state = attach_error_state(page)
            for path in active_public_urls():
                results["all_desktop"].append(inspect_page(page, state, base, path, "1440x1000"))
            page.close()
            desktop.close()

            for size, name in [
                ({"width": 820, "height": 1100}, "820x1100"),
                ({"width": 390, "height": 844}, "390x844"),
            ]:
                context = browser.new_context(viewport=size)
                context.set_default_timeout(7000)
                page = context.new_page()
                state = attach_error_state(page)
                for path in REPRESENTATIVE:
                    results["responsive"].append(inspect_page(page, state, base, path, name))
                page.close()
                context.close()

            # Desktop interactions.
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            context.set_default_timeout(7000)
            page = context.new_page()
            page.goto(base + "/index.html", wait_until="domcontentloaded")
            page.click("[data-search-open]")
            page.fill("[data-search-input]", "Eureka")
            results["interactions"]["global_search_results"] = page.locator(".search-result-card:visible").count()
            page.keyboard.press("Escape")

            page.locator(".content-upgrade-portfolio a[href='pages/projects/eureka-world.html']").click()
            page.wait_for_url("**/pages/projects/eureka-world.html")
            results["interactions"]["project_detail_link"] = page.url.endswith("/pages/projects/eureka-world.html")
            language_button = page.locator("[data-language-toggle]")
            language_button.click()
            english_link = page.locator("[data-language-menu] a[hreflang='en']").first
            english_href = english_link.get_attribute("href") or ""
            english_link.click()
            page.wait_for_load_state("domcontentloaded")
            results["interactions"]["project_language_continuity"] = page.url.endswith("/en/projects/eureka-world.html") and "eureka-world" in english_href

            page.goto(base + "/pages/newsletter.html", wait_until="domcontentloaded")
            disclosure = page.locator("[data-news-tab='disclosure']")
            disclosure.click()
            results["interactions"]["newsletter_disclosure_tab"] = disclosure.get_attribute("aria-selected") == "true" and page.locator("[data-news-panel='disclosure']:visible").count() == 1
            results["interactions"]["newsletter_seed_links"] = page.locator("a.news-seed-link").count()

            page.goto(base + "/pages/business.html", wait_until="domcontentloaded")
            cards = page.locator("[data-domain]")
            for index in range(cards.count()):
                cards.nth(index).click()
            results["interactions"]["cybertron_all_modules"] = page.locator("[data-cybertron-stage].is-complete").count() == 1
            page.close()
            context.close()

            # Mobile interactions.
            context = browser.new_context(viewport={"width": 390, "height": 844})
            context.set_default_timeout(7000)
            page = context.new_page()
            page.goto(base + "/index.html", wait_until="domcontentloaded")
            page.click("[data-mobile-menu-open]")
            results["interactions"]["mobile_menu_open"] = page.locator("[data-mobile-drawer].is-open").count() == 1
            page.click("[data-mobile-menu-close]")

            captured_inquiries: list[dict] = []
            def inquiry_route(route):
                if route.request.method == "POST" and "/api/public/inquiries" in route.request.url:
                    captured_inquiries.append(route.request.post_data_json or {})
                    route.fulfill(
                        status=201,
                        content_type="application/json",
                        body=json.dumps({"success": True, "data": {"inquiryId": 42, "status": "new", "notificationQueued": True}}),
                    )
                else:
                    route.continue_()
            page.route("**/api/public/inquiries", inquiry_route)
            page.goto(base + "/pages/contact.html", wait_until="domcontentloaded")
            page.click("[data-inquiry-submit]")
            results["interactions"]["contact_validation_errors"] = page.locator(".field-error:not(:empty)").count()
            page.fill("#name", "테스트 사용자")
            page.fill("#email", "tester@example.com")
            page.fill("#message", "운영 Worker 문의 API 제출 흐름을 브라우저에서 검증합니다.")
            page.check("#privacy")
            page.click("[data-inquiry-submit]")
            page.wait_for_timeout(120)
            results["interactions"]["contact_api_called"] = len(captured_inquiries) == 1 and captured_inquiries[0].get("email") == "tester@example.com"
            results["interactions"]["contact_success"] = page.locator("[data-inquiry-success]:visible").count() == 1
            results["interactions"]["contact_reference"] = page.locator("[data-inquiry-reference]").inner_text().strip() == "JBM-000042"
            page.close()
            context.close()

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

    output = ROOT / "browser-qa-public.json"
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
