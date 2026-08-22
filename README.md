# Gaming Website

This is a starter Next.js application that provides:

- GitHub OAuth (NextAuth)
- A simple page model with HTML content
- Admin-only page creation/editing with WYSIWYG builder and templates
- Server-side sanitization of submitted HTML (using sanitize-html) with a host allowlist for iframe embeds

How to run locally

1. Copy .env.example to .env and fill in values (GITHUB client id/secret and ADMIN_REG_CODE).
   - To auto-promote a GitHub account on first sign-in, set INITIAL_ADMIN_EMAIL to that account's email.
   - To permit iframe embeds from specific hosts, set ALLOW_IFRAME=true and ALLOWED_IFRAME_HOSTS=comma,separated,hosts (e.g. youtube.com,itch.io)

2. Install dependencies: npm install
3. Run Prisma migrate (or just generate client): npx prisma migrate dev --name init
4. Run dev server: npm run dev

OAuth Callback URL

Set the GitHub OAuth App "Authorization callback URL" to:

    http://localhost:3000/api/auth/callback/github

This must match your NEXTAUTH_URL + /api/auth/callback/github exactly.

Security and iframe allowlist

- The server sanitizes HTML on create/update. By default iframe tags are removed. If you set ALLOW_IFRAME=true then iframe tags are considered but each iframe's src host is checked against ALLOWED_IFRAME_HOSTS — only allowed hosts will be preserved.
- Use ALLOWED_IFRAME_HOSTS to restrict embeds to trusted providers (youtube.com, itch.io, etc.). Host matching allows subdomains (e.g., www.youtube.com) when the base host is listed (youtube.com).

Admin onboarding

- INITIAL_ADMIN_EMAIL can be set to auto-promote a single GitHub account on first sign-in instead of using ADMIN_REG_CODE.
