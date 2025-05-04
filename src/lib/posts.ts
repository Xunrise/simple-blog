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


export const getAllPosts = cache(async function getAllPosts(): Promise<Post[]> {
  // Get remote posts from Vercel Blob storage
  const response = await list({mode: 'folded', prefix: 'posts/'})
  const remotePosts = await Promise.all(
    response.blobs
      .filter(blob => blob.pathname.endsWith('.mdx') || blob.pathname.endsWith('.md'))
      .map(async (blob) => {
        const response = await fetch(blob.url)
        const fileContents = await response.text()
        const { data: metadata, content } = matter(fileContents)
        const slug = blob.pathname.replace(/\.mdx$/, '').replace('posts/', '')

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
  return remotePosts.sort((a, b) => (a.date < b.date ? 1 : -1))
});