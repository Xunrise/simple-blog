'use client'

import { useEffect, useState } from 'react'
import type { Post } from '../lib/types'

export function Sidebar({ posts }: { posts: Post[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    const articles = document.querySelectorAll('article')
    articles.forEach((article) => observer.observe(article))

    return () => {
      articles.forEach((article) => observer.unobserve(article))
    }
  }, [])

  return (
    <aside 
      className="fixed top-1/3 w-48 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-4 space-y-2 hidden lg:block border border-gray-100 dark:border-zinc-800" 
      style={{ left: 'calc(50% + 21rem)' }}
    >
      <nav className="space-y-1">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`#${post.slug}`}
            className={`block p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-all duration-200 ${
              activeId === post.slug 
                ? 'bg-gray-100 dark:bg-zinc-800/70 shadow-sm text-gray-900 dark:text-white' 
                : ''
            }`}
          >
            {post.title}
          </a>
        ))}
      </nav>
    </aside>
  )
} 