import path from 'path'
import { Post } from './types'
import fs from 'fs'
import matter from 'gray-matter'

function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove any markdown formatting
  const plainText = content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/[#*`_~]/g, '') // Remove markdown symbols
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  if (plainText.length <= maxLength) return plainText
  
  // Find the last complete word within maxLength
  const truncated = plainText.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpace) + '...'
}

const postsDirectory = path.join(process.cwd(), 'src/posts')

export async function getAllPosts(): Promise<Post[]> {
  const filenames = fs.readdirSync(postsDirectory)
  const posts = filenames
    .filter((filename) => filename.endsWith('.mdx') || filename.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data: metadata, content } = matter(fileContents)
      const slug = filename.replace(/\.mdx$/, '')

      return {
        slug,
        content,
        title: metadata.title as string,
        date: metadata.date as string,
        category: (metadata.category as string) || 'Uncategorized',
        excerpt: generateExcerpt(content)
      }
    })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}