import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function PageViewer() {
  const router = useRouter()
  const { slug } = router.query
  const [page, setPage] = useState(null)

  useEffect(() => {
    if (slug) fetchPage()
  }, [slug])

  async function fetchPage() {
    const res = await axios.get(`/api/pages/${slug}`)
    setPage(res.data)
  }

  if (!page) return <div className="main">Loading...</div>

  return (
    <div className="main">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />

      <style jsx>{`
        .main { padding:24px }
      `}</style>
    </div>
  )
}
