'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { Post } from '@/lib/types'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useSession, signOut } from 'next-auth/react'
import { Combobox } from '@headlessui/react'

interface MarkdownButton {
  label: string
  icon: string
  prefix: string
  suffix: string
  block?: boolean
}

const markdownButtons: MarkdownButton[] = [
  { label: 'Bold', icon: 'B', prefix: '**', suffix: '**' },
  { label: 'Italic', icon: 'I', prefix: '_', suffix: '_' },
  { label: 'Link', icon: '🔗', prefix: '[', suffix: '](url)' },
  { label: 'Code', icon: '`', prefix: '`', suffix: '`' },
  { label: 'Code Block', icon: '```', prefix: '\n```\n', suffix: '\n```\n', block: true },
  { label: 'Quote', icon: '"', prefix: '> ', suffix: '', block: true },
  { label: 'Bullet List', icon: '•', prefix: '- ', suffix: '', block: true },
  { label: 'Numbered List', icon: '1.', prefix: '1. ', suffix: '', block: true },
  { label: 'Heading 2', icon: 'H2', prefix: '## ', suffix: '', block: true },
  { label: 'Heading 3', icon: 'H3', prefix: '### ', suffix: '', block: true },
]

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Uncategorized'
  })
  const [categoryQuery, setCategoryQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [editedPosts, setEditedPosts] = useState<Record<string, { title: string; content: string }>>({})
  const [deletingPosts, setDeletingPosts] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Get unique categories from posts - ensure no duplicates
  const categories = [...new Set(['Uncategorized', ...posts.map(post => post.category)])]

  // Filter categories based on query
  const filteredCategories = categoryQuery === ''
    ? categories
    : categories.filter((category) =>
        category.toLowerCase().includes(categoryQuery.toLowerCase())
      )

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(editedPosts).length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editedPosts])

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts')
        if (!res.ok) throw new Error('Failed to fetch posts')
        const data = await res.json()
        setPosts(Array.isArray(data) ? data : [])
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching posts:', error)
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Check if the current post has unsaved changes
  const hasUnsavedChanges = (post: Post) => {
    const originalPost = posts.find(p => p.slug === post.slug)
    return originalPost && (originalPost.title !== post.title || originalPost.content !== post.content)
  }

  // Update editedPosts when the selected post changes
  useEffect(() => {
    if (selectedPost) {
      if (hasUnsavedChanges(selectedPost)) {
        setEditedPosts(prev => ({
          ...prev,
          [selectedPost.slug]: {
            title: selectedPost.title,
            content: selectedPost.content
          }
        }))
      } else {
        // If no changes, remove from editedPosts
        const { [selectedPost.slug]: _, ...remainingEdits } = editedPosts
        setEditedPosts(remainingEdits)
      }
    }
  }, [selectedPost?.title, selectedPost?.content])

  const handlePostSelect = async (post: Post | null) => {
    setIsVisible(false) // Start fade out
    await new Promise(resolve => setTimeout(resolve, 150)) // Wait for fade out
    
    if (post) {
      // If we have edited version, use that instead of original
      const editedVersion = editedPosts[post.slug]
      if (editedVersion) {
        setSelectedPost({
          ...post,
          title: editedVersion.title,
          content: editedVersion.content
        })
      } else {
        setSelectedPost({
          ...post,
          content: post.content
        })
      }
    } else {
      setSelectedPost(null)
    }
    
    // Close sidebar on mobile when a post is selected
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
    
    setIsVisible(true) // Start fade in
  }

  // Add state for draft post
  const [draftPost, setDraftPost] = useState({
    title: '',
    content: ''
  })

  // Update draft when editing new post
  useEffect(() => {
    if (!selectedPost) {
      setDraftPost(newPost)
    }
  }, [newPost, selectedPost])

  // Add dialog states
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
    isDestructive?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
    isDestructive: false
  })

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPost) return

    setDialog({
      isOpen: true,
      title: 'Save Changes',
      message: 'Are you sure you want to save changes to this post?',
      confirmLabel: 'Save Changes',
      onConfirm: async () => {
        try {
          setIsProcessing(true)
          const res = await fetch(`/api/posts/${selectedPost.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedPost)
          })

          if (!res.ok) throw new Error('Failed to update post')

          // Fetch updated posts
          const postsRes = await fetch('/api/posts')
          if (!postsRes.ok) throw new Error('Failed to fetch updated posts')
          const data = await postsRes.json()
          setPosts(Array.isArray(data) ? data : [])
          
          // Remove from edited posts after successful save
          const { [selectedPost.slug]: _, ...remainingEdits } = editedPosts
          setEditedPosts(remainingEdits)
        } catch (error) {
          console.error('Failed to update post:', error)
        } finally {
          setIsProcessing(false)
        }
        setDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setDialog({
      isOpen: true,
      title: 'Create Post',
      message: 'Are you sure you want to create this post?',
      confirmLabel: 'Create Post',
      onConfirm: async () => {
        const slug = newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        try {
          setIsProcessing(true)
          const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newPost,
              slug
            })
          })

          if (!res.ok) throw new Error('Failed to create post')

          // Fetch updated posts
          const postsRes = await fetch('/api/posts')
          if (!postsRes.ok) throw new Error('Failed to fetch updated posts')
          const data = await postsRes.json()
          setPosts(Array.isArray(data) ? data : [])
          setNewPost({ 
            title: '', 
            content: '', 
            date: new Date().toISOString().split('T')[0],
            category: 'Uncategorized'
          })
        } catch (error) {
          console.error('Failed to create post:', error)
        } finally {
          setIsProcessing(false)
        }
        setDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleDeletePost = async (slug: string) => {
    setDialog({
      isOpen: true,
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmLabel: 'Delete Post',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setDialog(prev => ({ ...prev, isOpen: false }))
          // Start animation after dialog closes
          await new Promise(resolve => setTimeout(resolve, 100))
          setDeletingPosts(prev => [...prev, slug])
          setIsDeleting(true)

          const res = await fetch(`/api/posts/${slug}`, {
            method: 'DELETE'
          })

          if (!res.ok) throw new Error('Failed to delete post')
          
          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 500))

          // Fetch updated posts
          const postsRes = await fetch('/api/posts')
          if (!postsRes.ok) throw new Error('Failed to fetch updated posts')
          const data = await postsRes.json()
          setPosts(Array.isArray(data) ? data : [])
          if (selectedPost?.slug === slug) {
            setSelectedPost(null)
          }
          setDeletingPosts(prev => prev.filter(s => s !== slug))
          setIsDeleting(false)
        } catch (error) {
          console.error('Failed to delete post:', error)
          setDeletingPosts(prev => prev.filter(s => s !== slug))
          setIsDeleting(false)
        }
      }
    })
  }

  const insertMarkdown = (content: string, setContent: (value: string) => void, prefix: string, suffix: string, block = false) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const beforeText = content.substring(0, start)
    const afterText = content.substring(end)
    
    let newText
    let newCursorPos

    if (block) {
      // For block elements, ensure we're starting on a new line
      const needsNewLineBefore = beforeText.length > 0 && !beforeText.endsWith('\n')
      const needsNewLineAfter = afterText.length > 0 && !afterText.startsWith('\n')
      
      newText = beforeText +
        (needsNewLineBefore ? '\n' : '') +
        prefix +
        (selectedText || '') +
        suffix +
        (needsNewLineAfter ? '\n' : '') +
        afterText

      // Position cursor inside the block
      newCursorPos = beforeText.length + (needsNewLineBefore ? 1 : 0) + prefix.length + (selectedText ? selectedText.length : 0)
    } else {
      // For inline elements
      newText = beforeText +
        prefix +
        (selectedText || '') +
        suffix +
        afterText

      // Position cursor after the inserted text for inline elements
      newCursorPos = beforeText.length + prefix.length + (selectedText ? selectedText.length : 0)
    }

    setContent(newText)

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
  }

  // Use a memoized mobile state at the component level instead of inside renderEditor
  const [isMobileToolbar, setIsMobileToolbar] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileToolbar(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const renderEditor = (content: string, setContent: (value: string) => void) => (
    <div className="flex flex-col h-full w-full space-y-1">
      <div className="flex flex-wrap gap-1 p-1 bg-gray-50 dark:bg-zinc-800 rounded-lg">
        {markdownButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => insertMarkdown(content, setContent, button.prefix, button.suffix, button.block)}
            className={`${isMobileToolbar ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'} font-medium bg-white dark:bg-zinc-700 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors`}
            title={button.label}
          >
            {button.icon}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 w-full">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write your post content in markdown format"
          required
        />
      </div>
    </div>
  )

  // Add auth-related UI elements
  const renderAuthStatus = () => {
    return (
      <div className="flex items-center gap-2">
        {session?.user?.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            className="w-8 h-8 rounded-full" 
          />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
          {session?.user?.name || session?.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
        >
          Sign Out
        </button>
      </div>
    )
  }

  // State for category selection and management
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the category dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategorySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderCategorySelector = (value: string, onChange: (value: string) => void) => {
    return (
      <div className="relative flex-1 min-w-0" ref={categoryDropdownRef}>
        {/* Current category display with dropdown toggle */}
        <div 
          className="flex items-center w-full text-base bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:border-transparent transition-colors cursor-pointer"
          onClick={() => {
            setShowCategorySelector(!showCategorySelector);
            setNewCategoryInput('');
            // Focus the input field when opening on mobile
            setTimeout(() => {
              if (categoryInputRef.current) {
                categoryInputRef.current.focus();
              }
            }, 50);
          }}
        >
          <span className="flex-grow truncate">{value || 'Uncategorized'}</span>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showCategorySelector ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown for category selection */}
        {showCategorySelector && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
            {/* Search/create new category input */}
            <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
              <input
                ref={categoryInputRef}
                type="text"
                className="w-full p-2 text-sm bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Search or create category..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newCategoryInput.trim()) {
                      onChange(newCategoryInput.trim());
                      setShowCategorySelector(false);
                      // Focus the editor after selection
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        textarea.focus();
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setShowCategorySelector(false);
                  }
                }}
              />
            </div>

            {/* List of existing categories */}
            <div className="max-h-60 overflow-y-auto py-1">
              {/* Always show Uncategorized option */}
              <div
                className={`py-2 px-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${value === 'Uncategorized' ? 'bg-blue-100 dark:bg-blue-900/30 font-medium' : ''}`}
                onClick={() => {
                  onChange('Uncategorized');
                  setShowCategorySelector(false);
                }}
              >
                Uncategorized
              </div>

              {/* Filtered categories based on input */}
              {categories
                .filter(category => 
                  // Don't show Uncategorized again since it's already shown above
                  category !== 'Uncategorized' && 
                  // Only filter by input if there's something typed
                  (newCategoryInput === '' || category.toLowerCase().includes(newCategoryInput.toLowerCase()))
                )
                .map(category => (
                  <div
                    key={category}
                    className={`py-2 px-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 ${value === category ? 'bg-blue-100 dark:bg-blue-900/30 font-medium' : ''}`}
                    onClick={() => {
                      onChange(category);
                      setShowCategorySelector(false);
                    }}
                  >
                    {category}
                  </div>
                ))}

              {/* Show option to create new category if input doesn't match existing ones */}
              {newCategoryInput.trim() !== '' && 
               !categories.some(c => c.toLowerCase() === newCategoryInput.toLowerCase()) && (
                <div
                  className="py-2 px-4 cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                  onClick={() => {
                    onChange(newCategoryInput.trim());
                    setShowCategorySelector(false);
                    // Focus the editor after selection
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                    }
                  }}
                >
                  Create "{newCategoryInput.trim()}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading posts...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        isDestructive={dialog.isDestructive}
      />
      {isProcessing && (
        <>
          <div className="fixed inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-[60]" />
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Processing...</p>
            </div>
          </div>
        </>
      )}
      
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-4 sm:py-8 h-screen overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-8">
          <h1 className="text-2xl font-bold">Blog Admin</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {renderAuthStatus()}
            <Link href="/" className="text-blue-500 hover:text-blue-600 mr-2">
              View Blog
            </Link>
            {/* Mobile sidebar toggle button */}
            <button 
              type="button" 
              className="md:hidden p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="relative flex h-[calc(100vh-6rem)]">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content area - full width on mobile, flex layout on desktop */}
          <div className="flex-1 h-full w-full overflow-hidden">
            <article className={`w-full h-full bg-white dark:bg-zinc-900 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg will-change-transform will-change-opacity ${
              isDeleting && selectedPost && deletingPosts.includes(selectedPost.slug) 
                ? 'translate-y-4 scale-95 opacity-0' 
                : 'translate-y-0 scale-100 opacity-100'
            } transition-all duration-300 ease-out overflow-hidden`}>
              <div className={`w-full h-full transition-opacity duration-150 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
                {selectedPost ? (
                  <form onSubmit={handleUpdatePost} className="h-full w-full overflow-hidden">
                    <div className="w-full h-full flex flex-col p-3 sm:p-8 overflow-hidden">
                      <input
                        type="text"
                        value={selectedPost.title}
                        onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                        className="w-full mb-2 sm:mb-4 text-xl sm:text-2xl font-bold bg-transparent border-0 p-1 sm:p-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 rounded-lg dark:text-gray-100"
                        placeholder="Post Title"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Post Title'}
                        required
                      />
                      <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-4 w-full">
                        <div className="relative flex-1 min-w-0">
                          <DatePicker
                            selected={selectedPost.date ? new Date(selectedPost.date) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                setSelectedPost({ 
                                  ...selectedPost, 
                                  date: date.toISOString().split('T')[0] 
                                })
                              }
                            }}
                            dateFormat="yyyy-MM-dd"
                            className="pl-9 text-sm sm:text-base bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 focus:border-transparent transition-colors w-full"
                            showPopperArrow={false}
                            fixedHeight
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            calendarClassName="!bg-gray-50 dark:!bg-zinc-800 !border-gray-200 dark:!border-zinc-700 !rounded-lg !shadow-lg !font-sans"
                            wrapperClassName="!w-full"
                            popperClassName="!z-50"
                            popperPlacement="bottom-start"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                            📅
                          </div>
                        </div>
                        {renderCategorySelector(
                          selectedPost.category,
                          (category: string) => setSelectedPost({ ...selectedPost, category })
                        )}
                      </div>
                      <div className="flex-1 min-h-0 w-full overflow-hidden">
                        {renderEditor(
                          selectedPost.content,
                          (value) => setSelectedPost({ ...selectedPost, content: value })
                        )}
                      </div>
                      <div className="flex justify-between mt-4 sm:mt-8 border-t pt-2 sm:pt-4 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleDeletePost(selectedPost.slug)}
                          className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                          Delete Post
                        </button>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDialog({
                                isOpen: true,
                                title: 'Revert Changes',
                                message: 'Are you sure you want to revert all changes? This will discard all unsaved edits.',
                                confirmLabel: 'Revert Changes',
                                onConfirm: () => {
                                  // Reset the post to its original state from the posts array
                                  const originalPost = posts.find(p => p.slug === selectedPost?.slug)
                                  if (originalPost) {
                                    setSelectedPost(originalPost)
                                    // Remove from edited posts
                                    const { [originalPost.slug]: _, ...remainingEdits } = editedPosts
                                    setEditedPosts(remainingEdits)
                                  }
                                  setDialog(prev => ({ ...prev, isOpen: false }))
                                },
                                isDestructive: true
                              })
                            }}
                            className="px-4 py-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                          >
                            Revert Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostSelect(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCreatePost} className="h-full w-full overflow-hidden">
                    <div className="w-full h-full flex flex-col p-3 sm:p-8 overflow-hidden">
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className="w-full mb-2 sm:mb-4 text-xl sm:text-2xl font-bold bg-transparent border-0 p-1 sm:p-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 rounded-lg dark:text-gray-100"
                        placeholder="Post Title"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Post Title'}
                        required
                      />
                      <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-4 w-full">
                        <div className="relative flex-1 min-w-0">
                          <DatePicker
                            selected={newPost.date ? new Date(newPost.date) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                setNewPost({ 
                                  ...newPost, 
                                  date: date.toISOString().split('T')[0] 
                                })
                              }
                            }}
                            dateFormat="yyyy-MM-dd"
                            className="pl-9 text-sm sm:text-base bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 focus:border-transparent transition-colors w-full"
                            showPopperArrow={false}
                            fixedHeight
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            calendarClassName="!bg-gray-50 dark:!bg-zinc-800 !border-gray-200 dark:!border-zinc-700 !rounded-lg !shadow-lg !font-sans"
                            wrapperClassName="!w-full"
                            popperClassName="!z-50"
                            popperPlacement="bottom-start"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                            📅
                          </div>
                        </div>
                        {renderCategorySelector(
                          newPost.category,
                          (category: string) => setNewPost({ ...newPost, category })
                        )}
                      </div>
                      <div className="flex-1 min-h-0 w-full overflow-hidden">
                        {renderEditor(
                          newPost.content,
                          (value) => setNewPost({ ...newPost, content: value })
                        )}
                      </div>
                      <div className="flex justify-between mt-4 sm:mt-8 border-t pt-2 sm:pt-4 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setDialog({
                              isOpen: true,
                              title: 'Discard Draft',
                              message: 'Are you sure you want to discard this draft? This will clear all content.',
                              confirmLabel: 'Discard Draft',
                              onConfirm: () => {
                                setNewPost({ 
                                  title: '', 
                                  content: '', 
                                  date: new Date().toISOString().split('T')[0],
                                  category: 'Uncategorized'
                                })
                                setDialog(prev => ({ ...prev, isOpen: false }))
                              },
                              isDestructive: true
                            })
                          }}
                          className="px-4 py-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                        >
                          Discard Draft
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Create Post
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar - slide out on mobile, fixed on desktop */}
          <aside className={`fixed md:relative inset-y-0 right-0 z-50 md:z-0 w-64 md:w-72 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:ml-0 md:mr-0 h-full md:h-auto`}>
            <div className="h-full md:sticky md:top-8 space-y-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-lg md:rounded-xl p-4 border border-gray-100 dark:border-zinc-800 overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-4 md:hidden pt-2">
                <h2 className="text-lg font-bold">Posts</h2>
                <button 
                  type="button" 
                  className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                <div className="group">
                  <div className={`flex items-center justify-between rounded-lg hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-all duration-200 ${
                    !selectedPost 
                      ? 'bg-gray-100/50 dark:bg-zinc-800/30' 
                      : newPost.content 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10'
                        : ''
                  }`}>
                    <div className="flex items-center w-full">
                      {newPost.content && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2 mr-1 flex-shrink-0" />
                      )}
                      <button
                        onClick={() => handlePostSelect(null)}
                        className="w-full text-left py-2 px-2 text-sm text-blue-500 dark:text-blue-400 font-medium truncate"
                      >
                        {draftPost.title || "✨ Create New Post"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-zinc-700 my-2" />

                {posts.map((post) => (
                  <div key={post.slug} className="group">
                    <div 
                      className={`flex items-center justify-between rounded-lg hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 will-change-transform will-change-opacity ${
                        selectedPost?.slug === post.slug 
                          ? 'bg-gray-100/50 dark:bg-zinc-800/30' 
                          : editedPosts[post.slug] 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : ''
                      } ${deletingPosts.includes(post.slug) ? 'opacity-0 -translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'} transition-all duration-300 ease-out cursor-pointer`}
                      onClick={() => handlePostSelect(post)}
                    >
                      <div className="flex items-center py-2 px-2 flex-grow min-w-0">
                        {editedPosts[post.slug] && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {post.title}
                        </span>
                      </div>
                      <div className="flex gap-1 px-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePost(post.slug)
                          }}
                          className="p-1 text-red-500 hover:text-red-600 hover:scale-90 transition-transform duration-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
} 