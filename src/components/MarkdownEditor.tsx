import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function MarkdownEditor({ value, onChange, placeholder, required }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && activeTab === 'edit') {
      setActiveTab('preview')
    } else if (isRightSwipe && activeTab === 'preview') {
      setActiveTab('edit')
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Desktop view: side-by-side editor and preview
  if (!isMobile) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-full w-full font-mono text-base p-4 leading-relaxed focus:ring-0 focus:outline-none whitespace-pre-wrap break-words dark:text-gray-300 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-y-auto resize-none bg-transparent focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
        />
        <div className="h-full w-full p-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50/50 dark:bg-zinc-800/50 overflow-y-auto flex justify-center">
          <div className="w-full max-w-2xl prose prose-sm dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {value || ' '}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  // Mobile view: tabs for switching between edit and preview
  return (
    <div 
      className="flex flex-col h-full w-full relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex border-b border-gray-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Preview
        </button>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          activeTab === 'edit' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="h-full w-full font-mono text-sm sm:text-base p-2 leading-relaxed focus:ring-0 focus:outline-none whitespace-pre-wrap break-words dark:text-gray-300 border-0 overflow-y-auto resize-none bg-transparent transition-colors duration-200"
          />
        </div>
        
        <div className={`absolute inset-0 transition-opacity duration-300 ${
          activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`}>
          <div className="h-full w-full p-2 bg-gray-50/50 dark:bg-zinc-800/50 overflow-y-auto">
            <div className="w-full prose prose-sm sm:prose-base dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {value || ' '}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1 italic">
        {activeTab === 'preview' ? 'Swipe right to edit' : 'Swipe left to preview'}
      </div>
    </div>
  )
}