import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req
  if (method === 'GET') {
    const pages = await prisma.page.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(pages)
    return
  }

  // Create page (admin only)
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Not authenticated' })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin only' })

  if (method === 'POST') {
    const { title, slug, content, template, isPublic } = req.body
    const page = await prisma.page.create({ data: { title, slug, content, template, isPublic } })
    res.json(page)
    return
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
