import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function OAuth2CallbackPage() {
  const [params] = useSearchParams()
  const { login } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const userId = params.get('userId')
    const email = params.get('email')
    const name = params.get('name')

    if (token && userId && email && name) {
      login(token, userId, email, name)
      navigate('/', { replace: true })
    } else {
      navigate('/login?error=oauth', { replace: true })
    }
  }, [params, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Completing sign-in…</p>
    </div>
  )
}
