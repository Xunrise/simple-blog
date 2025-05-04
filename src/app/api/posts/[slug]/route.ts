import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { title, content, date, category } = await request.json()
    const { slug } = params

    // Create markdown content with frontmatter
    const markdown = `---
title: '${title}'
date: '${date}'
category: '${category || 'Uncategorized'}'
---

${content}`

    // Upload to Vercel Blob storage as MDX
    const blob = await put(`posts/${slug}.mdx`, markdown, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    })

    return NextResponse.json({ success: true, blob })
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    await del(`posts/${slug}.mdx`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
} 