'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaPaperPlane } from 'react-icons/fa'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm an AI trained on Idan's resume. How can I help you learn more about his experience and skills?" 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      setRemainingMessages(data.remainingMessages)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : "I'm sorry, I encountered an error. Please try again." 
      }])
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] max-w-md w-full flex flex-col"
    >
      <div className="bg-blue-500 text-white p-4">
        <h2 className="text-xl font-bold">Chat with My Resume</h2>
        {remainingMessages !== null && (
          <p className="text-sm mt-1">
            {remainingMessages} messages remaining today
          </p>
        )}
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[300px]">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-lg">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Idan's experience or skills..."
            className="flex-grow px-3 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || remainingMessages === 0}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white px-3 py-1 rounded-r-md transition duration-300 ${
              isLoading || remainingMessages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isLoading || remainingMessages === 0}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default Chat
