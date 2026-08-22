import { getSession } from 'next-auth/react'
import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req

  if (method === 'POST') {
    // register for admin using a secret code
    const { code } = req.body
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: 'Not authenticated' })
    if (code && code === process.env.ADMIN_REG_CODE) {
      await prisma.user.update({ where: { email: session.user.email }, data: { isAdmin: true } })
      return res.json({ ok: true })
    }
    return res.status(403).json({ error: 'Invalid code' })
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end('Method Not Allowed')
}
