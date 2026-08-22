import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { slug } = req.query
  const method = req.method

  if (method === 'GET') {
    const page = await prisma.page.findUnique({ where: { slug } })
    if (!page) return res.status(404).json({ error: 'Not found' })
    return res.json(page)
  }

  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Not authenticated' })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !user.isAdmin) return res.status(403).json({ error: 'Admin only' })

  if (method === 'PUT') {
    const { title, content, template, isPublic } = req.body
    const page = await prisma.page.update({ where: { slug }, data: { title, content, template, isPublic } })
    return res.json(page)
  }

  if (method === 'DELETE') {
    await prisma.page.delete({ where: { slug } })
    return res.json({ ok: true })
  }

  res.setHeader('Allow', ['GET','PUT','DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
