import { Suspense } from 'react'
import { MobileSidebar } from '../components/MobileSidebar'
import { getAllPosts } from '@/lib/posts'
import Image from 'next/image'

// Helper function to group posts by category
function groupPostsByCategory(posts: any[]) {
  return posts.reduce((acc, post) => {
    const category = post.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(post)
    return acc
  }, {})
}

export default async function Home() {
  const posts = await getAllPosts()
  const groupedPosts = groupPostsByCategory(posts)

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Mobile sidebar controller */}
        <Suspense fallback={null}>
          <MobileSidebar posts={posts} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* Left Column - About Me */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4 space-y-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-zinc-800">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src="/profile-placeholder.jpg"
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Eline's Blog</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Welcome to my personal blog where I share my thoughts and experiences about technology, life, and everything in between.
                </p>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About Me</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  I'm a passionate writer and developer who loves to explore new ideas and share knowledge with others.
                </p>
              </div>
            </div>
          </aside>

          {/* Center Column - Category Cards */}
          <main className="lg:col-span-6">
            <div className="space-y-8">
              {Object.entries(groupedPosts).map(([category, categoryPosts]) => (
                <section key={category} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-zinc-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(categoryPosts as any[]).slice(0, 2).map((post) => (
                      <a
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className="block group"
                      >
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {post.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            {post.date}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>

          {/* Right Column - All Posts */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4 space-y-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Posts</h2>
              <nav className="space-y-2">
                {posts.map((post) => (
                  <a
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="block group"
                  >
                    <div className="rounded-lg p-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {post.title}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {post.date}
                      </div>
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
