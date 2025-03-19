import { Suspense } from 'react'
import { MobileSidebar } from '../components/MobileSidebar'
import { getAllPosts } from '@/lib/posts'
import PostsList from '../components/PostsList'

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Mobile sidebar controller */}
        <Suspense fallback={null}>
          <MobileSidebar posts={posts} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          {/* Main content area - full width on mobile, 4 columns on desktop */}
          <div className="lg:col-span-6 lg:col-start-4">
            <div className="space-y-8 sm:space-y-16">
              <PostsList posts={posts} />
            </div>
          </div>

          {/* Desktop sidebar - only visible on desktop */}
          <aside className="hidden lg:block lg:col-span-2 lg:col-start-11">
            <div className="sticky top-4 sm:top-8 mb-4"> 
              <a href='/admin' className="text-center justify-between text-gray-800 dark:text-gray-100">Admin Area</a>
            </div>
            <div className="sticky top-4 sm:top-8 space-y-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100 dark:border-zinc-800">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Posts</h4>
              <nav className="space-y-1">
                {posts.map((post) => (
                  <div key={post.slug} className="group">
                    <div className="flex items-center justify-between rounded-lg hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-all duration-200">
                      <a
                        href={`#${post.slug}`}
                        className="block py-1.5 sm:py-2 px-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-grow truncate"
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
