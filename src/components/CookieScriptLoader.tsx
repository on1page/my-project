'use client'

import { useEffect, useState } from 'react'
import { useCookieAllowed } from '@/hooks/useCookieConsent'
import { loadScript, type CookieType, type LoadScriptOptions } from '@/lib/cookie-manager'

interface CookieScriptLoaderProps {
  /**
   * Tipo di cookie richiesto per caricare questo script
   * 'tecnici' | 'analitici' | 'marketing'
   */
  cookieType: CookieType

  /**
   * URL dello script da caricare
   */
  src: string

  /**
   * ID univoco dello script (utile per evitare duplicati)
   */
  id?: string

  /**
   * Opzioni aggiuntive per lo script
   */
  options?: LoadScriptOptions

  /**
   * Callback quando lo script viene caricato con successo
   */
  onLoad?: () => void

  /**
   * Callback quando il caricamento fallisce
   */
  onError?: (error: Error) => void

  /**
   * Callback quando il consenso cambia (ma prima del caricamento)
   */
  onConsentChange?: (allowed: boolean) => void

  /**
   * Se true, non carica lo script ma mostra lo stato
   * Utile per debug
   */
  debug?: boolean
}

/**
 * Componente per caricare script di terze parti in modo condizionale
 * in base alle preferenze cookie dell'utente
 *
 * @example
 * ```tsx
 * <CookieScriptLoader
 *   cookieType="analitici"
 *   src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
 *   id="gtag-js"
 *   onLoad={() => console.log('Google Analytics caricato')}
 * />
 * ```
 */
export default function CookieScriptLoader({
  cookieType,
  src,
  id,
  options = {},
  onLoad,
  onError,
  onConsentChange,
  debug = false
}: CookieScriptLoaderProps) {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Verifica se il cookie è permesso
  const allowed = useCookieAllowed(cookieType)

  // Carica lo script quando permesso
  useEffect(() => {
    // Notifica il cambio di consenso
    if (onConsentChange) {
      onConsentChange(allowed)
    }

    // Se non permesso o già caricato, non fare nulla
    if (!allowed || loaded) {
      if (debug) {
        console.log(`[CookieScriptLoader] Script ${id || src}:`, {
          allowed,
          loaded,
          action: 'skip'
        })
      }
      return
    }

    let isMounted = true

    // Configura le opzioni complete
    const scriptOptions: LoadScriptOptions = {
      ...options,
      id: id || options.id,
      onLoad: () => {
        if (!isMounted) return

        setLoading(false)
        setLoaded(true)
        console.log(`[CookieScriptLoader] Script caricato con successo:`, id || src)

        if (onLoad) {
          onLoad()
        }
      },
      onError: (err) => {
        if (!isMounted) return

        setLoading(false)
        setError(err)
        console.error(`[CookieScriptLoader] Errore nel caricamento dello script:`, err)

        if (onError) {
          onError(err)
        }
      }
    }

    // Carica lo script
    loadScript(cookieType, src, scriptOptions)
      .then((script) => {
        if (!isMounted) return

        if (script) {
          // Lo script è stato caricato
          setLoaded(true)
          setLoading(false)
        } else {
          // Il caricamento è stato rifiutato (non permesso)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!isMounted) return

        setError(err)
        setLoading(false)
        console.error('[CookieScriptLoader] Errore:', err)

        if (onError) {
          onError(err)
        }
      })

    return () => {
      isMounted = false
    }
  }, [allowed, loaded, cookieType, src, id, options, onLoad, onError, onConsentChange, debug])

  // Gestisci lo stato di caricamento in modo asincrono
  useEffect(() => {
    if (allowed && !loaded && !error) {
      const timer = setTimeout(() => {
        setLoading(true)
      }, 0)
      return () => clearTimeout(timer)
    } else if (!allowed) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [allowed, loaded, error])

  // Rendering debug (visibile solo se debug=true)
  if (debug) {
    return (
      <div className="p-3 bg-gray-100 rounded border border-gray-300 text-xs font-mono">
        <div className="font-bold mb-2">🔧 CookieScriptLoader Debug</div>
        <div className="space-y-1">
          <div>Cookie Type: {cookieType}</div>
          <div>Allowed: <span className={allowed ? 'text-green-600' : 'text-red-600'}>
            {allowed ? 'YES' : 'NO'}
          </span></div>
          <div>Loading: {loading ? 'YES' : 'NO'}</div>
          <div>Loaded: {loaded ? 'YES' : 'NO'}</div>
          {error && <div className="text-red-600">Error: {error.message}</div>}
          <div>Source: {src}</div>
          {id && <div>ID: {id}</div>}
        </div>
      </div>
    )
  }

  // Rendering normale (invisibile)
  return null
}