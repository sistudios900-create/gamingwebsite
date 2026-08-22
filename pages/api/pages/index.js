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
      // force external links to open safely
      const href = attribs.href || ''
      return { tagName: 'a', attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } }
    }
  },
  allowedSchemesByTag: {
    iframe: ['http','https']
  }
})

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
    // sanitize server-side
    const allowIframe = process.env.ALLOW_IFRAME === 'true'
    const clean = sanitizeHtml(content || '', sanitizeOptions(allowIframe))
    const page = await prisma.page.create({ data: { title, slug, content: clean, template, isPublic } })
    res.json(page)
    return
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
