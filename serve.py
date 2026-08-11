from __future__ import annotations

import argparse
import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        requested = Path(self.translate_path(self.path))
        accepts_html = "text/html" in self.headers.get("Accept", "")
        if not requested.exists() and accepts_html:
            self.path = "/index.html"
        return super().send_head()


def main() -> None:
    parser = argparse.ArgumentParser(description="JINBIZ MANAGEMENT local static server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--directory", default=str(ROOT))
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    directory = str(Path(args.directory).resolve())
    handler = lambda *a, **kw: Handler(*a, directory=directory, **kw)
    with socketserver.TCPServer((args.host, args.port), handler) as server:
        print(f"JINBIZ Website + ERP: http://{args.host}:{args.port}/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
