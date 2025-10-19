'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  className?: string
}

export default function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  // Generate new captcha numbers
  const generateCaptcha = () => {
    const newNum1 = Math.floor(Math.random() * 10) + 1
    const newNum2 = Math.floor(Math.random() * 10) + 1
    setNum1(newNum1)
    setNum2(newNum2)
    setUserAnswer('')
    setIsVerified(false)
    setError('')
    onVerify(false)
  }

  // Generate initial captcha on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserAnswer(value)
    setError('')

    // Check if answer is correct
    const correctAnswer = num1 + num2
    const userNum = parseInt(value)
    
    if (value && !isNaN(userNum)) {
      if (userNum === correctAnswer) {
        setIsVerified(true)
        onVerify(true)
      } else {
        setIsVerified(false)
        onVerify(false)
      }
    } else {
      setIsVerified(false)
      onVerify(false)
    }
  }

  const handleRefresh = () => {
    generateCaptcha()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-900">
        Security Verification *
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
          <span className="text-lg font-semibold text-gray-900">{num1}</span>
          <span className="text-gray-600">+</span>
          <span className="text-lg font-semibold text-gray-900">{num2}</span>
          <span className="text-gray-600">=</span>
        </div>
        
        <input
          type="number"
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="?"
          className={`w-16 px-2 py-2 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            isVerified 
              ? 'border-green-500 bg-green-50' 
              : userAnswer && !isVerified 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
          }`}
        />
        
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Generate new question"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {isVerified && (
        <p className="text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verification complete
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Please solve the math problem above to verify you're not a robot
      </p>
    </div>
  )
}
