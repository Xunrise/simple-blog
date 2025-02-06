import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function MarkdownEditor({ value, onChange, placeholder, required }: MarkdownEditorProps) {
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