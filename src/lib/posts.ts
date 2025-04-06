import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post } from './types'

const postsDirectory = path.join(process.cwd(), 'posts')

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

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug,
      content,
      title: data.title as string,
      date: data.date as string,
      category: (data.category as string) || 'Uncategorized',
      excerpt: generateExcerpt(content)
    }
  })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}