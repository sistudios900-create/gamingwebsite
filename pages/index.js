import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'

export default function Home() {
  const [pages, setPages] = useState([])

  useEffect(() => {
    fetchPages()
  }, [])

  async function fetchPages() {
    const res = await axios.get('/api/pages')
    setPages(res.data)
  }

  return (
    <div className="app-root">
      <Head>
        <title>Gaming Website</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="layout">
        <Sidebar pages={pages} />

        <main className="main">
          <h1 className="title">Welcome to the Gaming Hub</h1>
          <p className="lead">Create game pages, add HTML or URLs, and share with everyone.</p>

          <section>
            <h2>Featured</h2>
            <div className="card-grid">
              {pages.slice(0, 3).map(p => (
                <Link key={p.id} href={`/page/${p.slug}`} className="card">
                  <h3>{p.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: p.content.substring(0, 120) + '...' }} />
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .app-root { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        .layout { display: flex; min-height: 100vh; }
        .main { flex: 1; padding: 48px; background: #f7f8fa }
        .title { font-size: 32px; margin: 0 0 8px 0 }
        .lead { color: #555 }
        .card-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-top:12px }
        .card { display:block; padding:16px; background:white; border-radius:8px; text-decoration:none; color:inherit; box-shadow:0 1px 6px rgba(0,0,0,0.06) }
      `}</style>
    </div>
  )
}
