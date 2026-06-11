# Hostinger Deployment Checklist

Production domain: **https://structonixsistem.com**

## 1. Hostinger setup

- [ ] Create Node.js hosting plan or VPS on Hostinger
- [ ] Connect domain `structonixsistem.com` to hosting
- [ ] Enable SSL certificate (Let's Encrypt)
- [ ] Configure redirect: `www.structonixsistem.com` → `structonixsistem.com` (or vice versa)

## 2. Environment variables

Set in Hostinger panel (or `.env` on VPS):

```env
NEXT_PUBLIC_SITE_URL=https://structonixsistem.com
RESEND_API_KEY=<your Resend API key>
RESEND_FROM=Structonix <info@structonixsistem.com>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<reCAPTCHA v3 site key>
RECAPTCHA_SECRET_KEY=<reCAPTCHA v3 secret key>
```

See `.env.example` for descriptions.

## 3. Resend email

- [ ] Create account at [resend.com](https://resend.com)
- [ ] Add and verify domain `structonixsistem.com` (DNS records)
- [ ] Create API key → set `RESEND_API_KEY`
- [ ] Set `RESEND_FROM` to verified address (e.g. `info@structonixsistem.com`)
- [ ] Send test email via contact form after deploy

## 4. Google reCAPTCHA v3

- [ ] Create v3 keys at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [ ] Add domains: `structonixsistem.com`, `localhost` (for local testing)
- [ ] Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`

## 5. Build & deploy

```bash
npm ci
npm run build
npm run start
```

Or configure Hostinger to run build on deploy from Git repository.

- [ ] Node.js version ≥ 20
- [ ] Set start command: `npm run start`
- [ ] Set output/port as required by Hostinger (default 3000)

## 6. Static assets

- [ ] Add Open Graph image: `/public/og/structonix-og.jpg` (1200×630) — see `docs/PRODUCTION_ASSETS.md`
- [ ] Add favicons — see `docs/PRODUCTION_ASSETS.md`

## 7. Post-deploy verification

- [ ] Home page loads: `https://structonixsistem.com`
- [ ] All locales: `/en`, `/ru`
- [ ] Service pages including `/servicios/carpinteria`
- [ ] Contact form sends email to `info@structonixsistem.com`
- [ ] `https://structonixsistem.com/sitemap.xml` — 33 URLs, correct domain
- [ ] `https://structonixsistem.com/robots.txt` — sitemap reference
- [ ] View page source — canonical URL includes locale prefix for EN/RU
- [ ] Privacy policy: `/politica-de-privacidad`
- [ ] Submit sitemap to Google Search Console

## 8. DNS records (typical)

| Type | Name | Value |
|------|------|-------|
| A | @ | Hostinger server IP |
| CNAME | www | structonixsistem.com |
| TXT | @ | Resend domain verification |
| TXT | @ | Google reCAPTCHA (if required) |

Adjust per Hostinger and Resend documentation.
