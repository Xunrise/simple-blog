import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
}

interface PostsListProps {
  posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
  return (
    <>
      {posts.map((post) => (
        <article 
          key={post.slug} 
          id={post.slug}
          className="mx-auto p-4 sm:p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="prose prose-sm sm:prose lg:prose-xl dark:prose-invert">
            <h2 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{post.title}</h2>
            <div className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-4 text-xs sm:text-sm">{post.date}</div>
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {post.content || ' '}
            </ReactMarkdown>
          </div>
        </article>
      ))}
    </>
  )
} 