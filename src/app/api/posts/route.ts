import { NextResponse } from 'next/server'
import { list, put, del } from '@vercel/blob'
import matter from 'gray-matter'

export async function GET() {
  try {
    // Get remote posts from Vercel Blob storage
    const response = await list({ mode: 'folded', prefix: 'posts/' })
    const posts = await Promise.all(
      response.blobs
        .filter(blob => blob.pathname.endsWith('.mdx') || blob.pathname.endsWith('.md'))
        .map(async (blob) => {
          const response = await fetch(blob.url)
          const fileContents = await response.text()
          const { data, content } = matter(fileContents)
          const slug = blob.pathname.replace(/\.mdx?$/, '').replace('posts/', '')

          return {
            slug,
            content,
            title: data.title as string,
            date: data.date as string,
            category: (data.category as string) || 'Uncategorized'
          }
        })
    )

    // Sort posts by date
    posts.sort((a, b) => (a.date < b.date ? 1 : -1))

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, date, slug } = await request.json()

    // Create markdown content
    const markdown = `---
title: '${title}'
date: '${date}'
---

${content}`

    // Upload to Vercel Blob storage
    const blob = await put(`posts/${slug}.md`, markdown, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    })

    return NextResponse.json({ success: true, blob })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
} 