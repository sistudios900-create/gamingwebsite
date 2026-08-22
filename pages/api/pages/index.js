import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'
import sanitizeHtml from 'sanitize-html'

function buildSanitizeOptions(allowIframe = false, allowedHosts = []) {
  const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3'])
  if (allowIframe) allowedTags.push('iframe')

  const options = {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href','name','target','rel'],
      img: ['src','alt','width','height'],
      iframe: ['src','width','height','frameborder','allow','allowfullscreen']
    },
    transformTags: {
      'a': (tagName, attribs) => ({ tagName: 'a', attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } }),
      'iframe': (tagName, attribs) => {
        // If iframe is not allowed at all, strip it
        if (!allowIframe) return { tagName: 'div', text: '' }
        try {
          const url = new URL(attribs.src)
          const host = url.hostname || ''
          const allowed = allowedHosts.some(h => host === h || host.endsWith('.' + h))
          if (!allowed) return { tagName: 'div', text: '' }
          // Keep only safe attributes
          const safe = {}
          if (attribs.src) safe.src = attribs.src
          if (attribs.width) safe.width = attribs.width
          if (attribs.height) safe.height = attribs.height
          if (attribs.allow) safe.allow = attribs.allow
          if (attribs.allowfullscreen) safe.allowfullscreen = attribs.allowfullscreen
          return { tagName: 'iframe', attribs: safe }
        } catch (e) {
          return { tagName: 'div', text: '' }
        }
      }
    },
    allowedSchemesByTag: {
      iframe: ['http','https']
    }
  }
  return options
}

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
    const allowedHosts = (process.env.ALLOWED_IFRAME_HOSTS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const clean = sanitizeHtml(content || '', buildSanitizeOptions(allowIframe, allowedHosts))
    const page = await prisma.page.create({ data: { title, slug, content: clean, template, isPublic } })
    res.json(page)
    return
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
