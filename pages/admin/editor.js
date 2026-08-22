import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

const templates = [
  {
    id: 'game-landing',
    name: 'Game Landing',
    html: `<div style="padding:20px"><h2>Game Title</h2><p>Short description of the game.</p><div style="margin-top:12px"><a href="#" target="_blank">Play Now</a></div></div>`
  },
  {
    id: 'game-embed',
    name: 'Game Embed (iframe)',
    html: `<div style="padding:20px"><h2>Game Embed</h2><p>Paste an iframe URL below in HTML mode to embed a game.</p><div style="background:#000;color:#fff;padding:12px;border-radius:8px">[iframe here]</div></div>`
  },
  {
    id: 'text-update',
    name: 'Text Update / News',
    html: `<div style="padding:20px"><h2>Update Title</h2><p>Write your update or news here.</p></div>`
  }
]

export default function EditorPage() {
  const { query } = useRouter()
  const router = useRouter()
  const { data: session } = useSession()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState(templates[0].id)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.slug) fetchPage(query.slug)
  }, [query.slug])

  async function fetchPage(slug) {
    try {
      const res = await axios.get(`/api/pages/${slug}`)
      const p = res.data
      setTitle(p.title)
      setSlug(p.slug)
      setContent(p.content)
      setIsPublic(p.isPublic)
    } catch (e) {
      console.error(e)
    }
  }

  function applyTemplate(id) {
    const t = templates.find(tt => tt.id === id)
    if (t) setContent(t.html)
  }

  async function save() {
    setLoading(true)
    try {
      if (!title || !slug) return alert('Title and slug required')
      const payload = { title, slug, content, template: templateId, isPublic }
      if (query.slug) {
        await axios.put(`/api/pages/${query.slug}`, payload)
      } else {
        await axios.post('/api/pages', payload)
      }
      router.push('/admin')
    } catch (e) {
      console.error(e)
      alert('Error saving page')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return <div style={{padding:24}}>Please sign in.</div>
  if (!session.user.isAdmin) return <div style={{padding:24}}>Unauthorized — admin only.</div>

  return (
    <div style={{padding:24}}>
      <h1>{query.slug ? 'Edit Page' : 'Create Page'}</h1>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:20,marginTop:12}}>
        <div>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:6}} />

          <label style={{marginTop:10}}>Slug (url)</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:6}} />

          <label style={{display:'block',marginTop:10}}>Content</label>
          <ReactQuill theme="snow" value={content} onChange={setContent} style={{height:300,marginBottom:12}} />

          <div style={{display:'flex',gap:8}}>
            <button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button onClick={() => router.push('/admin')} style={{background:'#666'}}>Cancel</button>
            <button onClick={() => { navigator.clipboard.writeText(content); alert('HTML copied') }} style={{background:'#0b8043'}}>Copy HTML</button>
          </div>
        </div>

        <aside style={{background:'#fff',padding:12,borderRadius:8,boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
          <div>
            <h3>Templates</h3>
            <select value={templateId} onChange={e => { setTemplateId(e.target.value); applyTemplate(e.target.value) }} style={{width:'100%',padding:8,borderRadius:6}}>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div style={{marginTop:12}}>
            <label style={{display:'block'}}>Visibility</label>
            <select value={isPublic ? 'public' : 'private'} onChange={e => setIsPublic(e.target.value==='public')} style={{width:'100%',padding:8,borderRadius:6}}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div style={{marginTop:12}}>
            <h4>Preview</h4>
            <div style={{border:'1px solid #eee',padding:12,borderRadius:6,height:220,overflow:'auto'}} dangerouslySetInnerHTML={{__html:content}} />
          </div>

          <div style={{marginTop:12,fontSize:12,color:'#666'}}>
            Note: Submitted HTML is sanitized on the server. To allow iframe/game embeds set ALLOW_IFRAME=true in your environment (admin only).
          </div>
        </aside>
      </div>

    </div>
  )
}
