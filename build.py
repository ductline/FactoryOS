#!/usr/bin/env python3
"""Build index.html (GitHub Pages, Firebase) from app.html (the page as published on claude.ai)."""
import pathlib
root = pathlib.Path(__file__).parent
app = (root / "app.html").read_text(encoding="utf-8")
head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="ductline-mark.png">
<script src="firebase-config.js"></script>
<script src="fb-shim.js"></script>
"""
i = app.index("<style>")
out = head + app[:i] + app[i:].replace("</style>", "</style>\n</head>\n<body>", 1) + "\n</body>\n</html>\n"
(root / "index.html").write_text(out, encoding="utf-8")
print("index.html built,", len(out), "bytes")
