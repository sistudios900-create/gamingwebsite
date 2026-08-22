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
      // let NextAuth create the JWT session; we upsert the user into DB
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name, image: user.image },
          create: { email: user.email, name: user.name, image: user.image }
        })
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    async session({ session }) {
      // Append isAdmin flag
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) session.user.isAdmin = dbUser.isAdmin
      return session
    }
  }
})
