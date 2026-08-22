import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function AdminIndex() {
  const { data: session } = useSession()
  const [pages, setPages] = useState([])

  useEffect(() => {
    if (session && session.user && session.user.isAdmin !== undefined) {
      if (!session.user.isAdmin) return
      fetchPages()
    }
  }, [session])

  async function fetchPages() {
    const res = await axios.get('/api/pages')
    setPages(res.data)
  }

  if (!session) return <div style={{padding:24}}>Please sign in to access admin.</div>
  if (!session.user.isAdmin) return <div style={{padding:24}}>You are not an admin.</div>

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Admin Dashboard</h1>
        <Link href="/admin/editor"><button>Create Page</button></Link>
      </div>

      <table style={{width:'100%',marginTop:12,borderCollapse:'collapse'}}>
        <thead>
          <tr style={{textAlign:'left',borderBottom:'1px solid #eee'}}>
            <th>Title</th>
            <th>Slug</th>
            <th>Public</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(p => (
            <tr key={p.id} style={{borderBottom:'1px solid #fafafa'}}>
              <td>{p.title}</td>
              <td>{p.slug}</td>
              <td>{p.isPublic ? 'Yes' : 'No'}</td>
              <td>
                <Link href={`/admin/editor?slug=${p.slug}`}><button style={{marginRight:8}}>Edit</button></Link>
                <Link href={`/page/${p.slug}`}><button style={{background:'#666'}}>View</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
