#!/usr/bin/env python3
"""
site_mirror.py — Download a copy of a website for offline viewing / archiving.

Legitimate uses: offline reading, archiving your own site, scraping public
content you're allowed to access, inspecting a page's structure.

Usage:
    python3 site_mirror.py https://example.com
    python3 site_mirror.py https://example.com --depth 2 --out ./mycopy

It respects robots.txt by default. Only use it on sites you own or are
permitted to copy.
"""

import argparse
import os
import sys
import time
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Install deps first:  pip install requests beautifulsoup4")


def same_site(a, b):
    return urlparse(a).netloc == urlparse(b).netloc


def safe_path(out_dir, url):
    parsed = urlparse(url)
    path = parsed.path
    if path.endswith("/") or path == "":
        path += "index.html"
    if not os.path.splitext(path)[1]:
        path += "/index.html"
    local = os.path.join(out_dir, parsed.netloc, path.lstrip("/"))
    os.makedirs(os.path.dirname(local), exist_ok=True)
    return local


def mirror(start_url, out_dir, max_depth, delay, respect_robots):
    session = requests.Session()
    session.headers["User-Agent"] = "site-mirror/1.0 (offline archiver)"

    robots = None
    if respect_robots:
        robots = RobotFileParser()
        robots.set_url(urljoin(start_url, "/robots.txt"))
        try:
            robots.read()
        except Exception:
            robots = None

    seen = set()
    queue = [(start_url, 0)]

    while queue:
        url, depth = queue.pop(0)
        if url in seen or depth > max_depth:
            continue
        seen.add(url)

        if robots and not robots.can_fetch(session.headers["User-Agent"], url):
            print(f"[robots] skipping {url}")
            continue

        try:
            r = session.get(url, timeout=15)
        except Exception as e:
            print(f"[error] {url}: {e}")
            continue

        local = safe_path(out_dir, url)
        with open(local, "wb") as f:
            f.write(r.content)
        print(f"[saved] {url} -> {local}")

        ctype = r.headers.get("Content-Type", "")
        if "text/html" in ctype and depth < max_depth:
            soup = BeautifulSoup(r.text, "html.parser")
            for tag, attr in (("a", "href"), ("link", "href"),
                              ("img", "src"), ("script", "src")):
                for el in soup.find_all(tag):
                    link = el.get(attr)
                    if not link:
                        continue
                    nxt = urljoin(url, link)
                    if same_site(start_url, nxt) and nxt not in seen:
                        queue.append((nxt, depth + 1))

        time.sleep(delay)

    print(f"\nDone. {len(seen)} URLs processed. Copy is in: {out_dir}")


def main():
    p = argparse.ArgumentParser(description="Mirror a website for offline use.")
    p.add_argument("url")
    p.add_argument("--out", default="./site_copy")
    p.add_argument("--depth", type=int, default=1, help="link-following depth")
    p.add_argument("--delay", type=float, default=0.5, help="seconds between requests")
    p.add_argument("--ignore-robots", action="store_true")
    args = p.parse_args()

    os.makedirs(args.out, exist_ok=True)
    mirror(args.url, args.out, args.depth, args.delay,
           respect_robots=not args.ignore_robots)


if __name__ == "__main__":
    main()
