'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, initialColor = '#ea580c' }: { children: ReactNode, initialColor?: string }) {
  const [primaryColor, setPrimaryColor] = useState(initialColor)

  useEffect(() => {
    // Applica il colore a CSS variables
    const root = document.documentElement

    // Calcola varianti del colore
    const { r, g, b } = hexToRgb(primaryColor)
    const lighterColor = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
    const darkerColor = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`

    // Imposta il colore primario per entrambe le modalità (light e dark)
    root.style.setProperty('--primary', primaryColor)
    console.log('🎨 ThemeProvider: impostato --primary a', primaryColor)

    // Imposta le varianti
    root.style.setProperty('--primary-light', lighterColor)
    root.style.setProperty('--primary-dark', darkerColor)
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`)

    // Calcola e imposta il colore di foreground (testo sopra il colore primario)
    // Usa una formula di luminosità per determinare se usare testo bianco o nero
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const foregroundColor = luminance > 0.5 ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'
    root.style.setProperty('--primary-foreground', foregroundColor)
    console.log('🎨 ThemeProvider: impostato --primary-foreground a', foregroundColor, '(luminance:', luminance.toFixed(2), ')')

    // Aggiorna anche le variabili sidebar per coerenza
    root.style.setProperty('--sidebar-primary', primaryColor)
    root.style.setProperty('--sidebar-primary-foreground', foregroundColor)

    // Aggiorna anche per dark mode (imposta gli stessi valori per coerenza)
    const darkModeStyles = `
      :is(.dark *) {
        --primary: ${primaryColor} !important;
        --primary-foreground: ${foregroundColor} !important;
        --sidebar-primary: ${primaryColor} !important;
        --sidebar-primary-foreground: ${foregroundColor} !important;
      }
    `

    // Rimuovi vecchi stili dark mode se esistono
    const existingDarkStyles = document.getElementById('dynamic-theme-dark')
    if (existingDarkStyles) {
      existingDarkStyles.remove()
    }

    // Aggiungi nuovi stili dark mode
    const styleElement = document.createElement('style')
    styleElement.id = 'dynamic-theme-dark'
    styleElement.textContent = darkModeStyles
    document.head.appendChild(styleElement)

    // Aggiorna theme-color per mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', primaryColor)
    }

    // Aggiorna anche msapplication-TileColor
    const metaTileColor = document.querySelector('meta[name="msapplication-TileColor"]')
    if (metaTileColor) {
      metaTileColor.setAttribute('content', primaryColor)
    }
  }, [primaryColor])

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Helper function per convertire HEX in RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 234, g: 88, b: 12 } // Default arancione
}
