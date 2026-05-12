from pathlib import Path

from flask import Flask, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

app = Flask(__name__, static_folder=None)


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(DIST_DIR / "assets", filename, max_age=31536000)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    requested_file = DIST_DIR / path

    if path and requested_file.is_file():
        return send_from_directory(DIST_DIR, path)

    return send_from_directory(DIST_DIR, "index.html")
