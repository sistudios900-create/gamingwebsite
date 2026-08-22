import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import prisma from '../../../lib/prisma'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // If INITIAL_ADMIN_EMAIL is set and matches this user's email, promote to admin on sign-in
        const isInitialAdmin = process.env.INITIAL_ADMIN_EMAIL && user.email && (user.email.toLowerCase() === process.env.INITIAL_ADMIN_EMAIL.toLowerCase())

        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name, image: user.image, isAdmin: isInitialAdmin ? true : undefined },
          create: { email: user.email, name: user.name, image: user.image, isAdmin: isInitialAdmin ? true : false }
        })
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    async session({ session }) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) session.user.isAdmin = dbUser.isAdmin
      return session
    }
  }
})
