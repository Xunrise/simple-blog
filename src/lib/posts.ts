import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post } from './types'

const postsDirectory = path.join(process.cwd(), 'posts')

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
    }
  })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
} 