import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'
import sanitizeHtml from 'sanitize-html'

const sanitizeOptions = (allowIframe) => ({
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3','iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href','name','target','rel'],
    img: ['src','alt','width','height'],
    iframe: ['src','width','height','frameborder','allow','allowfullscreen']
  },
  transformTags: {
    'a': (tagName, attribs) => {
      return { tagName: 'a', attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } }
    }
  },
  allowedSchemesByTag: {
    iframe: ['http','https']
  }
})

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
    const allowIframe = process.env.ALLOW_IFRAME === 'true'
    const clean = sanitizeHtml(content || '', sanitizeOptions(allowIframe))
    const page = await prisma.page.update({ where: { slug }, data: { title, content: clean, template, isPublic } })
    return res.json(page)
  }

  if (method === 'DELETE') {
    await prisma.page.delete({ where: { slug } })
    return res.json({ ok: true })
  }

  res.setHeader('Allow', ['GET','PUT','DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
