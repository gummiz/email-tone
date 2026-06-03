'use client'

import { useState } from 'react'
import { Search, Mail, User, AlertCircle } from 'lucide-react'
import { DEMO_CONTACTS } from '@/lib/demo-data'

interface ContactSearchProps {
  onContactFound: (contact: {name: string, email: string}) => void
}

export default function ContactSearch({ onContactFound }: ContactSearchProps) {
  const [searchInput, setSearchInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch('/api/gmail/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: query.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      onContactFound(data.contact)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search emails')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchInput)
  }

  const handleChipClick = (name: string) => {
    setSearchInput(name)
    handleSearch(name)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Search className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Contact</h2>
        <p className="text-gray-600">
          Enter a name or email address to analyze your communication history
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter name or email address..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSearching}
          />
        </div>

        <button
          type="submit"
          disabled={!searchInput.trim() || isSearching}
          className="w-full mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Searching...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Search Conversations
            </div>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg max-w-md mx-auto">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">No results</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Demo contact chips */}
      <div className="mt-8 max-w-md mx-auto">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Try these demo contacts
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_CONTACTS.map((contact) => (
            <button
              key={contact.email}
              onClick={() => handleChipClick(contact.name)}
              disabled={isSearching}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{contact.name}</span>
              <span className="text-xs text-indigo-400 font-normal">{contact.role}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
        <div className="flex items-start">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">What happens next?</p>
            <p>We scan the last 10 conversations with your contact and build a tone profile — formality, greeting style, patterns — so your next email feels right.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
