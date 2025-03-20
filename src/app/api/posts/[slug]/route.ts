import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const postsDirectory = path.join(process.cwd(), 'posts')

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { title, content, date } = await request.json()
    const resolvedParams = await params
    const filePath = path.join(postsDirectory, `${resolvedParams.slug}.md`)

    // Create markdown content
    const markdown = `---
title: '${title}'
date: '${date}'
---

${content}`

    // Write to file
    fs.writeFileSync(filePath, markdown)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const filePath = path.join(postsDirectory, `${resolvedParams.slug}.md`)
    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
} 