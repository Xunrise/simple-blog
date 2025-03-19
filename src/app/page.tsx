import { getAllPosts } from '@/lib/posts'
import type { Post } from '../lib/types'
import { Sidebar } from '@/components/Sidebar'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main content area - 4 columns, centered */}
          <div className="col-span-6 col-start-4">
            <div className="space-y-16">
              {posts.map((post) => (
                <article 
                  key={post.slug} 
                  id={post.slug}
                  className="mx-auto p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="prose lg:prose-xl dark:prose-invert">
                    <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">{post.title}</h2>
                    <div className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{post.date}</div>
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                      {post.content || ' '}
                    </ReactMarkdown>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar - 2 columns */}
          <aside className="col-span-2 col-start-11">
            <div className="sticky top-8 space-y-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100 dark:border-zinc-800">
              <nav className="space-y-1">
                {posts.map((post) => (
                  <div key={post.slug} className="group">
                    <div className="flex items-center justify-between rounded-lg hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-all duration-200">
                      <a
                        href={`#${post.slug}`}
                        className="block py-2 px-2 text-sm text-gray-700 dark:text-gray-300 flex-grow truncate"
                      >
                        {post.title}
                      </a>
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
