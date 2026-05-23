import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextValue {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ledger_theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('ledger_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Apply on first render too (avoid FOUC)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
