import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

interface Props {
  unreadAlerts?: number
}

const mainItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/assets', label: 'Assets', icon: '💰' },
  { to: '/liabilities', label: 'Debts', icon: '📉' },
  { to: '/insurance', label: 'Insurance', icon: '🛡️' },
]

const moreItems = [
  { to: '/alerts', label: 'Alerts', icon: '🔔', isAlerts: true },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/trusted-persons', label: 'Trusted Persons', icon: '👥' },
  { to: '/digital-accounts', label: 'Digital Accounts', icon: '🔐' },
  { to: '/will', label: 'Will', icon: '📜' },
]

export default function BottomNav({ unreadAlerts = 0 }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  const handleMoreNav = (to: string) => {
    setDrawerOpen(false)
    navigate(to)
  }

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-50">
        {mainItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs gap-0.5 px-2 py-1 rounded ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex flex-col items-center text-xs gap-0.5 px-2 py-1 rounded text-gray-500"
        >
          <span className="text-lg leading-none">⋯</span>
          <span>More</span>
          {unreadAlerts > 0 && (
            <span className="absolute top-0 right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full leading-none py-0.5 min-w-[16px] text-center">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </button>
      </nav>

      {/* More drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl pb-6 pt-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <div className="px-4 space-y-1">
              {moreItems.map(item => (
                <button
                  key={item.to}
                  onClick={() => handleMoreNav(item.to)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-left"
                >
                  <span className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.isAlerts && unreadAlerts > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
