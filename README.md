# Drop Physics Studio

React/Vite studio for previewing the start drop page and the container arrival page, then opening either one as a full-screen standalone page with the current preview settings serialized into the URL.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## PythonAnywhere

This project includes a small Flask wrapper in `app.py` so PythonAnywhere can serve the Vite build and preserve standalone app routes such as `/actual/start` and `/actual/arrival`.

After cloning on PythonAnywhere, run:

```bash
npm install && npm run build && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

In the PythonAnywhere Web tab, set the WSGI file to import the Flask app:

```python
import sys
path = "/home/YOUR_USERNAME/drop-physics-studio"
if path not in sys.path:
    sys.path.insert(0, path)

from app import app as application
```
