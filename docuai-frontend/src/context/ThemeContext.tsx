import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeCtx {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeCtx>({} as ThemeCtx)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('pm_theme') === 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('pm_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)