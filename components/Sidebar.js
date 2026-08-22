import Link from 'next/link'

export default function Sidebar({ pages = [] }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h3>Gaming Hub</h3>
      </div>

      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          {pages.map(p => (
            <li key={p.id}><Link href={`/page/${p.slug}`}>{p.title}</Link></li>
          ))}
        </ul>
      </nav>

      <style jsx>{`
        .sidebar { width: 240px; padding:24px; background: white; border-right:1px solid #eee }
        .brand { font-weight:600; margin-bottom:12px }
        nav ul { list-style:none; padding:0 }
        nav li { margin:8px 0 }
      `}</style>
    </aside>
  )
}
