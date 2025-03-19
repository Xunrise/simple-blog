'use client'

import { useState, useRef, useEffect } from 'react'

interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
}

interface MobileSidebarProps {
  posts: Post[];
}

export function MobileSidebar({ posts }: MobileSidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  
  // Add swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  // Handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.menu-button')) {
        setIsMenuOpen(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.theme-button')) {
        setIsThemeMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    // Add swipe detection to the document
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart(e.touches[0].clientX)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.touches[0].clientX)
    }
    
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return
      
      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > 50
      const isRightSwipe = distance < -50
      
      if (isLeftSwipe && !isMenuOpen) {
        setIsMenuOpen(true)
      } else if (isRightSwipe && isMenuOpen) {
        setIsMenuOpen(false)
      }
      
      setTouchStart(null)
      setTouchEnd(null)
    }
    
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMenuOpen, touchStart, touchEnd])
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-40 lg:hidden">
        <button 
          className="menu-button p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Theme toggle button */}
      <div className="fixed top-4 right-16 z-40 lg:hidden">
        <button 
          className="theme-button p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md"
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          aria-label="Toggle theme"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
      
      {/* Theme switcher menu for mobile */}
      <div 
        ref={themeMenuRef}
        className={`fixed top-14 right-4 z-40 bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-2 transition-transform duration-300 transform lg:hidden ${isThemeMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-2">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Theme</p>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200">Light</button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200">Dark</button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200">System</button>
          </div>
        </div>
      </div>

      {/* Sidebar - hidden on mobile, shown as overlay when menu is opened */}
      <aside 
        ref={menuRef}
        className={`fixed inset-y-0 right-0 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="mb-8 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Menu</h3>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6"> 
            <a href='/admin' className="text-center block w-full py-2 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-800 dark:text-gray-100">Admin Area</a>
          </div>

          <div className="space-y-1 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Posts</h4>
            <nav className="space-y-1">
              {posts.map((post) => (
                <div key={post.slug} className="group">
                  <div className="flex items-center justify-between rounded-lg hover:bg-gray-100/50 dark:hover:bg-zinc-800/30 transition-all duration-200">
                    <a
                      href={`#${post.slug}`}
                      className="block py-1.5 sm:py-2 px-2 text-sm text-gray-700 dark:text-gray-300 flex-grow truncate"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {post.title}
                    </a>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
} 