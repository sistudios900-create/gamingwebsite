# Gaming Website

This is a starter Next.js application that provides:

- GitHub OAuth (NextAuth)
- A simple page model with HTML content
- Admin-only page creation/editing
- An endpoint to register as admin using a secret code

How to run locally

1. Copy .env.example to .env and fill in values (GITHUB client id/secret and ADMIN_REG_CODE).
2. Install dependencies: npm install
3. Run Prisma migrate (or just generate client): npx prisma migrate dev --name init
4. Run dev server: npm run dev

OAuth Callback URL

Set the GitHub OAuth App "Authorization callback URL" to:

    http://localhost:3000/api/auth/callback/github

This must match your NEXTAUTH_URL + /api/auth/callback/github exactly.
