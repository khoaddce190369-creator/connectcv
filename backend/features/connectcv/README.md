# ConnectCV owned AI features

This additive bundle preserves the existing React website and all account-team source files. `/ai/` is the feature UI on the backend origin. `/api/features/health` reports integration readiness; a successful health check does not mean AI is enabled.

## Required production integration

- Install root backend dependencies: the postinstall hook installs this bundle from its lockfile.
- Supply server-only `GEMINI_API_KEY`, `FEATURE_STATE_DIR` on persistent disk, and `FEATURE_SINGLE_PROCESS=true` with exactly one process/instance.
- Call `mount(app, { authenticate: trustedRequireAuth })` only after the account team provides middleware that verifies the token and sets `req.user.id`. Current upstream middleware is a placeholder; writes deliberately return 503. Never accept userId from the browser or enable the development JWT fallback.
- Use a sandboxed, isolated Chromium worker via `CV_BROWSER_WS_ENDPOINT=wss://...`. No key/profile data in its environment; only the local immutable assets may be loaded. The worker must have the same bundled fonts. Keep the worker authenticated, network isolated and resource limited. Do not disable Chromium sandbox to make deployment pass.
- Community rewards are persisted as pending unique `community:<postId>` events. The central credits team must credit them transactionally and idempotently; this module does not claim that a pending event increased a balance.
- Proxy `/api/` and `/ai/` to this backend from the existing website. React pages, original interviews/social feed and login are untouched. The account team supplies `window.connectCVGetAccessToken` in memory when using this UI; no demo login is shipped here.

## Deployment

Do not merge until all production requirements above are verified. Render automatic deploy occurs only if its service is configured to track the merged branch. GitHub push alone cannot establish hosting configuration or secrets.

CV/PDF, community abuse, SSRF/XSS, and source-fact tests are included. Local synthetic tests do not substitute for a staging test using the actual auth and browser worker.

Production demo jobs are disabled. Connect the jobs team's trusted data adapter; manual job descriptions remain supported.
