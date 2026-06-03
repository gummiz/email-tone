'use client'

import { useState, useEffect } from 'react'
import { Users, ArrowLeft, CheckCircle, BarChart3, AlertCircle } from 'lucide-react'

interface ToneAnalysisProps {
  contact: {name: string, email: string}
  onAnalysisComplete: (profile: any) => void
  onBack: () => void
}

export default function ToneAnalysis({ contact, onAnalysisComplete, onBack }: ToneAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisSteps, setAnalysisSteps] = useState([
    { step: 'Loading email history...', completed: false, current: true },
    { step: 'Processing email threads...', completed: false, current: false },
    { step: 'Analyzing communication patterns...', completed: false, current: false },
    { step: 'Generating tone profile...', completed: false, current: false }
  ])

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        // Step 1: Initialize
        await updateStep(0)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Step 2: Fetch emails
        await updateStep(1)

        // Get user's email from localStorage or prompt
        // For now, we'll use a placeholder - you might want to implement proper user auth
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com'

        const response = await fetch('/api/gmail/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: contact,
            userEmail: userEmail
          }),
        })

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        const transformedProfile = {
          formality: data.formality,
          greetingStyle: data.greetingStyle,
          closingStyle: data.closingStyle,
          avgLength: data.avgLength,
          keyPatterns: data.keyPatterns ?? [],
        };

        onAnalysisComplete(transformedProfile);

        // Step 3: Analyze patterns
        await updateStep(2)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Step 4: Generate profile
        await updateStep(3)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Complete analysis
        setIsAnalyzing(false)

      } catch (error) {
        console.error('Analysis failed:', error)
        setError(error instanceof Error ? error.message : 'Analysis failed')
        setIsAnalyzing(false)
      }
    }

    const updateStep = async (stepIndex: number) => {
      setAnalysisSteps(prev => prev.map((step, index) => ({
        ...step,
        completed: index < stepIndex,
        current: index === stepIndex
      })))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800))

      setAnalysisSteps(prev => prev.map((step, index) => ({
        ...step,
        completed: index <= stepIndex,
        current: index === stepIndex + 1
      })))
    }

    runAnalysis()
  }, [contact, onAnalysisComplete])

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
          <Users className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-medium text-gray-800">
            Analyzing: {contact.name} ({contact.email})
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <BarChart3 className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Communication Style</h2>
        <p className="text-gray-600">
          Processing your last 10 email conversations to understand your tone patterns
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {analysisSteps.map((step, index) => (
          <div key={index} className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-green-500' :
              step.current ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : step.current ? (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              )}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                step.completed ? 'text-green-700' :
                step.current ? 'text-indigo-700' : 'text-gray-500'
              }`}>
                {step.step}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isAnalyzing && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">Analysis Complete!</p>
          <p className="text-green-700 text-sm">Ready to compose your email with personalized tone guidance.</p>
        </div>
      )}
    </div>
  )
}