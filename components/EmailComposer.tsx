'use client'

import { useState } from 'react'
import { Edit3, ArrowLeft, Send, Lightbulb, RefreshCw } from 'lucide-react'

interface EmailComposerProps {
  contact: {name: string, email: string}
  toneProfile: any
  onBack: () => void
  onReset: () => void
}

export default function EmailComposer({ contact, toneProfile, onBack, onReset }: EmailComposerProps) {
  const [emailGoal, setEmailGoal] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateEmail = async () => {
    if (!emailGoal.trim()) return

    setIsGenerating(true)

    try {
      // TODO: Implement AI email generation based on tone profile and goal
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock generated email
      setSubject(`Re: ${emailGoal}`)
      setBody(`Hi ${contact.name},

I hope you're doing well! I wanted to reach out regarding ${emailGoal.toLowerCase()}.

[Your email content will be generated here based on your established communication patterns and the specific goal you've outlined.]

Let me know your thoughts, and I'm happy to discuss this further.

Best regards`)
    } catch (error) {
      console.error('Email generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Ensure toneProfile and its properties have safe defaults
  const safeToneProfile = toneProfile || {};
  const {
    formality = 'Not available',
    greetingStyle = 'Not available',
    closingStyle = 'Not available',
    avgLength = 'Not available',
    keyPatterns = ['No patterns available']
  } = safeToneProfile;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex items-center">
          <Edit3 className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-medium text-gray-800">
            Compose to: {contact?.name || 'Unknown Contact'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tone Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-indigo-50 rounded-lg p-6 sticky top-4">
            <h3 className="font-bold text-indigo-800 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Your Tone with {contact?.name || 'this contact'}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-indigo-700">Style:</span>
                <p className="text-indigo-600">{formality}</p>
              </div>
              <div>
                <span className="font-medium text-indigo-700">Greeting:</span>
                <p className="text-indigo-600">{greetingStyle}</p>
              </div>
              <div>
                <span className="font-medium text-indigo-700">Closing:</span>
                <p className="text-indigo-600">{closingStyle}</p>
              </div>
              <div>
                <span className="font-medium text-indigo-700">Length:</span>
                <p className="text-indigo-600">{avgLength}</p>
              </div>
              <div>
                <span className="font-medium text-indigo-700">Key Patterns:</span>
                <ul className="text-indigo-600 mt-1 space-y-1">
                  {Array.isArray(keyPatterns) && keyPatterns.length > 0 ? (
                    keyPatterns.map((pattern: string, index: number) => (
                      <li key={index} className="text-xs">• {pattern || 'No pattern'}</li>
                    ))
                  ) : (
                    <li className="text-xs">• No patterns available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Email Composer */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Email Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's the goal of this email?
              </label>
              <textarea
                value={emailGoal}
                onChange={(e) => setEmailGoal(e.target.value)}
                placeholder="e.g., Schedule a follow-up meeting, Request project update, Share feedback..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={generateEmail}
                disabled={!emailGoal.trim() || isGenerating}
                className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Email
                  </div>
                )}
              </button>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Your email content will appear here..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={12}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={onReset}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button
                disabled={!subject.trim() || !body.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}