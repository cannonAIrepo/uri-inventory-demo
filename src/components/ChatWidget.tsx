import { useState, useRef, useEffect, useCallback } from 'react'
import { type InventoryItem, type Branch } from '../data/inventory'
import { getChatResponse } from '../utils/chatbot'

interface Message {
  id: number
  role: 'assistant' | 'user'
  text: string
}

interface Props {
  branch: Branch
  items: InventoryItem[]
}

const SUGGESTIONS = ["Replace a ZR48K3-PFV", "What's low on stock?", 'Any critical items?', 'Give me a snapshot']

function greeting(branch: Branch) {
  return `Hi! I'm your URI inventory assistant for ${branch.name} · ${branch.city}. Ask me about stock levels, specific parts, or categories.`
}

export default function ChatWidget({ branch, items }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', text: greeting(branch) },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages([{ id: 0, role: 'assistant', text: greeting(branch) }])
  }, [branch.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = getChatResponse(trimmed, branch, items)
      setTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: response }])
    }, 550)
  }, [branch, items, typing])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: 480 }}
        >
          {/* Header */}
          <div className="bg-blue-700 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span className="text-white font-semibold text-sm">URI AI Assistant</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-xs">{branch.name} · {branch.city}</span>
              <button
                onClick={() => setOpen(false)}
                className="text-blue-200 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-700 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <span className="flex items-center gap-1">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only on first message */}
          {messages.length === 1 && !typing && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50 shrink-0">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendText(s)}
                  className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendText(input) }}
              placeholder="Ask about inventory…"
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
            <button
              onClick={() => sendText(input)}
              disabled={!input.trim() || typing}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2 transition-colors"
              aria-label="Send"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bubble trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Toggle assistant"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
