'use client'

import { useState, useEffect } from 'react'
import { Mail, Search, Users, Edit3, Send } from 'lucide-react'
import ContactSearch from '@/components/ContactSearch'
import ToneAnalysis from '@/components/ToneAnalysis'
import EmailComposer from '@/components/EmailComposer'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'search' | 'analyze' | 'compose'>('search')
  const [contactInfo, setContactInfo] = useState<{name: string, email: string} | null>(null)
  const [toneProfile, setToneProfile] = useState<any>(null)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('email-tone-intro-dismissed')
    if (!dismissed) setShowIntro(true)
  }, [])

  const dismissIntro = () => {
    localStorage.setItem('email-tone-intro-dismissed', '1')
    setShowIntro(false)
  }

  const handleContactFound = (contact: {name: string, email: string}) => {
    setContactInfo(contact)
    setCurrentStep('analyze')
  }

  const handleAnalysisComplete = (profile: any) => {
    setToneProfile(profile)
    setCurrentStep('compose')
  }

  const resetFlow = () => {
    setCurrentStep('search')
    setContactInfo(null)
    setToneProfile(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Tone Analyzer</h2>
            <p className="text-gray-600 mb-4">
              This tool reads a curated set of demo emails and uses Claude to extract how you naturally write to a specific person — your vocabulary, formality level, and typical phrasing.
            </p>
            <p className="text-gray-600 mb-4">
              Once the tone profile is built, you describe what you want to say and Claude drafts an email that sounds like <em>you</em> writing to <em>them</em>.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              All emails shown are demo data. No real inbox access is required.
            </p>
            <button
              onClick={dismissIntro}
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Got it →
            </button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Email Tone Analyzer</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analyze your communication patterns with specific contacts and compose emails that match your established tone
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Demo — sample contacts only
          </span>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'search' ? 'bg-indigo-600 text-white' :
              contactInfo ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Find Contact</span>
            </div>
            <div className={`w-8 h-0.5 ${contactInfo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'analyze' ? 'bg-indigo-600 text-white' :
              toneProfile ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Analyze Tone</span>
            </div>
            <div className={`w-8 h-0.5 ${toneProfile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'compose' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Compose Email</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'search' && (
            <ContactSearch onContactFound={handleContactFound} />
          )}

          {currentStep === 'analyze' && contactInfo && (
            <ToneAnalysis
              contact={contactInfo}
              onAnalysisComplete={handleAnalysisComplete}
              onBack={() => setCurrentStep('search')}
            />
          )}

          {currentStep === 'compose' && contactInfo && toneProfile && (
            <EmailComposer
              contact={contactInfo}
              toneProfile={toneProfile}
              onBack={() => setCurrentStep('analyze')}
              onReset={resetFlow}
            />
          )}
        </div>
      </div>
    </main>
  )
}