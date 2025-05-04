import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { title, content, date } = await request.json()
    const { slug } = params

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
    await del(`posts/${slug}.md`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
} 