# Triton Dashboard Handoff

This folder is the stable public handoff for the live Triton Dashboard at `ops.nauti-labs.com`.

- It is intentionally static so GitHub Pages can route old public demo paths to the working dashboard.
- `index.html` owns the launch-night Iris Auth screen, read-only workflow preview, approval queue, Crew Mode, and project lanes.
- Keep backend experiments out of this folder until they are ready to hydrate or replace the static shell.
- If the hosted app moves to Railway later, leave this page as the fallback and change DNS only after the Railway custom domain is green.
