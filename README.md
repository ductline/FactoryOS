# Ductline Factory OS

Production planning, stock, dispatch and drawing tagging for Ductline Manufacturing, Hyderabad.

## Files
- `app.html`: the app exactly as published on claude.ai (source of truth).
- `index.html`: the GitHub Pages build. It is `app.html` plus Firebase sign-in and database (`python3 build.py` rebuilds it).
- `fb-shim.js`: connects the app to Firebase (Firestore + Google sign-in) when it runs outside claude.ai.
- `firebase-config.js`: the Firebase project's web settings.
- `firestore.rules`: database security rules (paste into Firebase console > Firestore > Rules).
- `libredwg-web.wasm`, `dwg/`: DWG reader used in the browser.
- `tests/`: Playwright scripts used during development.

## Access
Nag (nagredy@gmail.com) is the owner. Staff sign in with Google; the owner adds their emails under **Team access** at the bottom of the page (Can edit / View only).

## Not available on the GitHub version
- Reading requirement sheets (PDF/photo) with Claude, and keeping uploaded drawings for later viewing: these use claude.ai services. DWG/DXF tagging, Excel part lists and work orders work.
