import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import BottomNav from './BottomNav'

const sidebarItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/assets', label: 'Assets', icon: '💰' },
  { to: '/liabilities', label: 'Liabilities', icon: '📉' },
  { to: '/insurance', label: 'Insurance', icon: '🛡️' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/trusted-persons', label: 'Trusted Persons', icon: '👥' },
  { to: '/digital-accounts', label: 'Digital Accounts', icon: '🔐' },
  { to: '/will', label: 'Will', icon: '📜' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
]

export default function Layout() {
  const { name, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-indigo-700">Life Ledger</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{name}</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
