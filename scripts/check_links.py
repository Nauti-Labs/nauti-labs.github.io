#!/usr/bin/env python3
"""Fail when a public page links to a parked host, or an internal link is missing."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARKED_HOSTS = (
    "clearance.nauti-labs.com",
    "promptly.nauti-labs.com",
    "neighbors.nauti-labs.com",
    "felipe-production-8624.up.railway.app",
)
URL_ATTRS = {"href", "src", "data-src", "content"}
SKIP_PREFIXES = ("mailto:", "tel:", "javascript:", "data:", "#", "about:")


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str]] = []
        self._refresh = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key.lower(): (value or "") for key, value in attrs}
        self._refresh = tag == "meta" and attr.get("http-equiv", "").lower() == "refresh"
        if tag == "meta":
            key = attr.get("property", "") or attr.get("name", "")
            if key.lower() in {"og:url", "og:image", "og:image:secure_url", "twitter:image"}:
                content = attr.get("content", "")
                if content:
                    self.urls.append(("content", content))
            if self._refresh and attr.get("content"):
                self.urls.append(("refresh", attr["content"]))
            return
        for name in ("href", "src", "data-src"):
            if attr.get(name):
                self.urls.append((name, attr[name]))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)


def parked(url: str) -> str | None:
    lowered = url.lower()
    for host in PARKED_HOSTS:
        if host in lowered:
            return host
    return None


def refresh_target(value: str) -> str:
    match = re.search(r"url\s*=\s*['\"]?([^'\";>\s]+)", value, re.I)
    return match.group(1) if match else ""


def local_target(page: Path, url: str) -> Path | None:
    path = url.split("#", 1)[0].split("?", 1)[0]
    if not path or path.startswith(SKIP_PREFIXES) or path.startswith(("http://", "https://", "//")):
        return None
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = (page.parent / path).resolve()
    try:
        target.relative_to(ROOT)
    except ValueError:
        return None
    return target


def exists(target: Path) -> bool:
    if target.is_file():
        return True
    if target.is_dir() and (target / "index.html").is_file():
        return True
    return False


def main() -> int:
    failures: list[str] = []
    pages = sorted(ROOT.rglob("*.html"))
    for page in pages:
        rel = page.relative_to(ROOT).as_posix()
        if rel.startswith("_"):
            continue
        text = page.read_text(encoding="utf-8", errors="replace")
        for host in PARKED_HOSTS:
            if host in text.lower():
                failures.append(f"{rel}: still mentions parked host {host}")
        parser = LinkParser()
        parser.feed(text)
        for kind, raw in parser.urls:
            url = refresh_target(raw) if kind == "refresh" else raw
            if not url or url.startswith(SKIP_PREFIXES):
                continue
            host = parked(url)
            if host:
                failures.append(f"{rel}: {kind} points at parked host {host} ({url})")
                continue
            target = local_target(page, url)
            if target is not None and not exists(target):
                failures.append(f"{rel}: missing internal target {url}")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        text = sitemap.read_text(encoding="utf-8")
        host = parked(text)
        if host:
            failures.append(f"sitemap.xml lists parked host {host}")
        if "https://nauti-labs.com/products/" not in text:
            failures.append("sitemap.xml is missing https://nauti-labs.com/products/")

    status = (ROOT / "suite" / "status.json").read_text(encoding="utf-8")
    for leaked in ("port", "models", "hostname", "ollama", "awake_guard", "mac mini"):
        if leaked in status.lower():
            failures.append(f"suite/status.json still contains {leaked}")

    served_server = ROOT / "neighbors-server.mjs"
    if served_server.exists():
        failures.append("neighbors-server.mjs is still in the published root")

    if failures:
        print("\n".join(failures))
        return 1
    print(f"Checked {len(pages)} HTML files. No parked hosts or broken internal links.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
