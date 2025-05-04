import path from 'path'
import { Post } from './types'
import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import {list} from "@vercel/blob";
import { blob } from 'stream/consumers'
import {cache} from 'react'

function generateExcerpt(content: string, maxLength = 200) {
  const plainText = content.replace(/[#*`_]/g, '')
  const truncated = plainText.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpace) + '...'
}

const postsDirectory = path.join(process.cwd(), 'src/posts')

export const getAllPosts = cache(async function getAllPosts(): Promise<Post[]> {
  // Get local posts
  const filenames = fs.readdirSync(postsDirectory)
  const localPosts = filenames
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

  // Get remote posts from Vercel Blob storage
  const response = await list()
  const remotePosts = await Promise.all(
    response.blobs
      .filter(blob => blob.pathname.endsWith('.mdx') || blob.pathname.endsWith('.md'))
      .map(async (blob) => {
        const response = await fetch(blob.url)
        const fileContents = await response.text()
        const { data: metadata, content } = matter(fileContents)
        const slug = blob.pathname.replace(/\.mdx$/, '')

        return {
          slug,
          content,
          title: metadata.title as string,
          date: metadata.date as string,
          category: (metadata.category as string) || 'Uncategorized',
          excerpt: generateExcerpt(content)
        }
      })
  )

  // Combine and sort all posts
  const allPosts = [...localPosts, ...remotePosts]
  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1))
});