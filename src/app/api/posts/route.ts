import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export async function GET() {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    const posts = fileNames.map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug: fileName.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        content
      }
    })

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

    // Write to file
    const filePath = path.join(postsDirectory, `${slug}.md`)
    fs.writeFileSync(filePath, markdown)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
} 