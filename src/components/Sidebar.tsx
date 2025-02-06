'use client'

import { useEffect, useState } from 'react'
import type { Post } from '../lib/types'

export function Sidebar({ posts }: { posts: Post[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) setActiveId(entry.target.id)
      })
    )

    document.querySelectorAll('article').forEach(article => {
      observer.observe(article)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <aside className="fixed top-24 right-8 w-48 p-4 border rounded-lg dark:border-zinc-800">
      <nav className="space-y-2">
        {posts.map(post => (
          <a
            key={post.slug}
            href={`#${post.slug}`}
            className={`block p-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 
              ${activeId === post.slug ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
          >
            {post.title}
          </a>
        ))}
      </nav>
    </aside>
  )
} 