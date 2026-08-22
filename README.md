# Gaming Website

This is a starter Next.js application that provides:

- GitHub OAuth (NextAuth)
- A simple page model with HTML content
- Admin-only page creation/editing with WYSIWYG builder and templates
- Server-side sanitization of submitted HTML (using sanitize-html)

How to run locally

1. Copy .env.example to .env and fill in values (GITHUB client id/secret and ADMIN_REG_CODE).
2. Install dependencies: npm install
3. Run Prisma migrate (or just generate client): npx prisma migrate dev --name init
4. Run dev server: npm run dev

OAuth Callback URL

Set the GitHub OAuth App "Authorization callback URL" to:

    http://localhost:3000/api/auth/callback/github

This must match your NEXTAUTH_URL + /api/auth/callback/github exactly.

Admin UI and sanitization

- The admin dashboard is at /admin. Only users with isAdmin=true can access. Use the /api/admin/register endpoint with your ADMIN_REG_CODE to promote an account.
- The editor (/admin/editor) provides a WYSIWYG editor with template picker and live preview.
- Submitted HTML is sanitized server-side using sanitize-html. By default iframe tags are allowed only if you set the environment variable ALLOW_IFRAME=true (caution: allowing iframes can introduce security risks). Use a trusted embed source.
