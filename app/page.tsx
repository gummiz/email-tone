'use client'

import { useState } from 'react'
import { Mail, Search, Users, Edit3, Send } from 'lucide-react'
import ContactSearch from '@/components/ContactSearch'
import ToneAnalysis from '@/components/ToneAnalysis'
import EmailComposer from '@/components/EmailComposer'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'search' | 'analyze' | 'compose'>('search')
  const [contactInfo, setContactInfo] = useState<{name: string, email: string} | null>(null)
  const [toneProfile, setToneProfile] = useState<any>(null)

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