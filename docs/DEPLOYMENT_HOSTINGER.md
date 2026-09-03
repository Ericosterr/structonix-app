# Hostinger Deployment Checklist

Production domain: **https://structonixsistem.com**

## Critical: CDN / RSC cache poisoning

Hostinger `hcdn` has been observed to cache App Router page responses with:

- `Cache-Control: s-maxage=31536000`
- `Vary` stripped / missing
- same URL serving either HTML or `text/x-component` (Flight)

That causes intermittent production failures:

1. Browser shows raw `$React.fragment` / Flight text instead of the page
2. HTML without CSS (stale HTML referencing deleted `/_next/static` chunks after redeploy)

This repo sets `private, no-store` + `CDN-Cache-Control: no-store` on locale/page responses. **After every deploy you must purge Hostinger CDN/page cache** or poisoned entries can remain for days (`Age` headers of 100k+ seconds were observed).

---

## 1. Hostinger setup

- [ ] Create Node.js hosting plan or VPS on Hostinger
- [ ] Connect domain `structonixsistem.com` to hosting
- [ ] Enable SSL certificate (Let's Encrypt)
- [ ] Configure redirect: `www.structonixsistem.com` → `structonixsistem.com` (or vice versa)
- [ ] Node.js **≥ 20**
- [ ] Prefer a **single** Node process (avoid overlapping old/new builds)

## 2. Environment variables

Set in Hostinger panel (do not delete existing secrets when redeploying):

```env
NEXT_PUBLIC_SITE_URL=https://structonixsistem.com
RESEND_API_KEY=<your Resend API key>
RESEND_FROM="Structonix <info@structonixsistem.com>"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<reCAPTCHA v3 site key>
RECAPTCHA_SECRET_KEY=<reCAPTCHA v3 secret key>
```

See `.env.example` for descriptions.

## 3. Safe production deploy (lockfile = npm)

Run on the Hostinger Node app (or CI that uploads a complete release):

```bash
# 1) Install exactly from lockfile
npm ci

# 2) Remove only the generated build output (keep env, uploads, public/)
rm -rf .next

# 3) Clean production build
npm run build

# 4) Confirm build succeeded (.next/BUILD_ID exists)
test -f .next/BUILD_ID && cat .next/BUILD_ID

# 5) Restart the Node.js application (Hostinger panel → Restart)
#    Start command: npm run start
#    Do not leave an old `next start` process serving a previous .next
```

**Do not:**

- Delete `.env` / panel environment variables
- Mix files from two builds (upload incomplete `.next`)
- Rely on CDN cache to “expire later” without a purge
- Run two Node apps against different build IDs at once

## 4. Caches to clear after deploy

Clear **all** of these if present:

1. Hostinger **CDN / hcdn / LiteSpeed** page cache for `structonixsistem.com`
2. Hostinger **Node.js app** cache (if listed separately)
3. Any Cloudflare / external CDN in front of the site
4. Browser hard-refresh only verifies one client — server/CDN purge is mandatory

Then verify with:

```bash
node scripts/probe-html-rsc.mjs https://structonixsistem.com 40
```

Expect `probe: PASS`. Document requests must be HTML with `Cache-Control` containing `no-store` (not `s-maxage=31536000`), and `/ru` must not return `text/x-component` for normal navigations.

## 5. Resend / reCAPTCHA

Unchanged — see previous checklist sections in git history if needed. Keep keys configured in the panel.

## 6. Post-deploy verification

- [ ] `https://structonixsistem.com` — styled HTML
- [ ] `/en`, `/ru` — styled HTML (not Flight text)
- [ ] Hard refresh + new tab for each locale
- [ ] Locale switch still uses full navigation
- [ ] `node scripts/probe-html-rsc.mjs https://structonixsistem.com 40` → PASS
- [ ] Contact form / careers still work
- [ ] `/sitemap.xml`, `/robots.txt`

## 7. Fast rollback

If production probe fails after deploy:

1. Redeploy the last known-good git commit (e.g. previous `main` SHA)
2. `npm ci && rm -rf .next && npm run build`
3. Restart Node.js
4. **Purge CDN again**
5. Re-run the probe

Do not roll back by only restoring old static files while leaving a new process (or vice versa).

## 8. DNS (typical)

| Type | Name | Value |
|------|------|-------|
| A | @ | Hostinger server IP |
| CNAME | www | structonixsistem.com |
| TXT | @ | Resend / Google as required |
