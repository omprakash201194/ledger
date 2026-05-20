import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-700">Life Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Family Financial Legacy Register</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Forgot password</h2>

          {submitted ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If <span className="font-medium">{email}</span> is registered, you'll receive a reset link within a few minutes. Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="block text-center text-sm text-indigo-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500">
                <Link to="/login" className="text-indigo-600 hover:underline">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
