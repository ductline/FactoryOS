# Ductline Factory OS

Production planning, stock, dispatch and drawing tagging for Ductline Manufacturing, Hyderabad.

- **Live app:** published as a claude.ai artifact (private). It gets its data, file storage and Claude reading from the claude.ai runtime (`window.claude`), so opening `index.html` outside claude.ai shows an empty app.
- **index.html** is the whole app: Floor (scrum board + capacity forecast), Drawings (DWG/DXF tagging, requirement sheets read by Claude), Work orders, Stock, Dispatches (from Zoho invoices), Material planning, Purchase (coils by gauge).
- **libredwg-web.wasm, dwg/**: DWG reader used in the browser.
- **tests/**: Playwright scripts used during development (they expect a local test harness with a mock `window.claude`).

Zoho dispatch sync runs as a scheduled task every two hours (7:32–21:32 IST) and writes invoices into the app's `dispatches` collection.
