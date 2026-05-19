import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/assets', label: 'Assets', icon: '💰' },
  { to: '/liabilities', label: 'Debts', icon: '📉' },
  { to: '/insurance', label: 'Insurance', icon: '🛡️' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-50">
      {navItems.map((item) => (
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
    </nav>
  )
}
