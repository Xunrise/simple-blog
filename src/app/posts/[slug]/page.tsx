import { getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { MobileSidebar } from '@/components/MobileSidebar'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const posts = await getAllPosts()
  const {slug} = await params
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Suspense fallback={null}>
          <MobileSidebar posts={posts} />
        </Suspense>

        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <time dateTime={post.date}>{post.date}</time>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                {post.category}
              </span>
            </div>
          </header>

          <div className="prose dark:prose-invert prose-lg max-w-none">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  )
} 