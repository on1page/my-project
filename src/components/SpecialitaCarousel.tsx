'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Articolo {
  id: string
  nome: string
  descrizione: string | null
  prezzo: number
  prezzoPromozionale: number | null
  scadenzaPromo: string | null
  eBestChoice: boolean
  immagineUrl: string | null
  immagineAiGenerata: boolean
}

interface SpecialitaCarouselProps {
  showBestChoice?: boolean
  showPromo?: boolean
  limit?: number
  title?: string
  subtitle?: string
}

export default function SpecialitaCarousel({
  showBestChoice = true,
  showPromo = true,
  limit = 6,
  title = "Le Nostre Specialità",
  subtitle = "Scopri i piatti più amati dai nostri clienti e le offerte speciali del momento"
}: SpecialitaCarouselProps) {
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchArticoli() {
      try {
        const params = new URLSearchParams()
        if (showBestChoice) params.append('bestChoice', 'true')
        if (showPromo) params.append('inPromo', 'true')

        const response = await fetch(`/api/admin/articoli?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setArticoli(data.slice(0, limit))
        }
      } catch (error) {
        console.error('Errore nel recupero articoli:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticoli()
  }, [showBestChoice, showPromo, limit])

  // Centra il primo elemento quando gli articoli sono caricati
  useEffect(() => {
    if (articoli.length > 0 && carouselRef.current) {
      const itemWidth = carouselRef.current.children[1]?.getBoundingClientRect().width || 0
      const spacerWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 0
      carouselRef.current.scrollTo({
        left: spacerWidth,
        behavior: 'smooth'
      })
    }
  }, [articoli.length])

  // Aggiorna l'indice attivo in base alla posizione dello scroll
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleScroll = () => {
      const scrollPosition = carousel.scrollLeft
      const itemWidth = carousel.children[1]?.getBoundingClientRect().width || 0 // Indice 1 perché 0 è lo spacer
      const spacerWidth = carousel.children[0]?.getBoundingClientRect().width || 0

      // Calcola l'indice considerando lo spacer iniziale
      const index = Math.round((scrollPosition - spacerWidth) / itemWidth)
      setActiveIndex(Math.min(Math.max(0, index), articoli.length - 1))
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [articoli.length])

  const scrollPrev = () => {
    if (carouselRef.current && activeIndex > 0) {
      const itemWidth = carouselRef.current.children[1]?.getBoundingClientRect().width || 0
      const spacerWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 0
      carouselRef.current.scrollTo({
        left: spacerWidth + (activeIndex - 1) * itemWidth,
        behavior: 'smooth'
      })
    }
  }

  const scrollNext = () => {
    if (carouselRef.current && activeIndex < articoli.length - 1) {
      const itemWidth = carouselRef.current.children[1]?.getBoundingClientRect().width || 0
      const spacerWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 0
      carouselRef.current.scrollTo({
        left: spacerWidth + (activeIndex + 1) * itemWidth,
        behavior: 'smooth'
      })
    }
  }

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.children[1]?.getBoundingClientRect().width || 0
      const spacerWidth = carouselRef.current.children[0]?.getBoundingClientRect().width || 0
      carouselRef.current.scrollTo({
        left: spacerWidth + index * itemWidth,
        behavior: 'smooth'
      })
    }
  }

  const isPromoValid = (scadenza: string | null) => {
    if (!scadenza) return false
    return new Date(scadenza) > new Date()
  }

  if (loading) {
    return (
      <section id="specialita" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (articoli.length === 0) {
    return null
  }

  return (
    <section id="specialita" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          {articoli.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={activeIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full bg-[rgb(15,23,43)] text-white border-none opacity-70 hover:opacity-100 hover:scale-110 transition-all shadow-lg disabled:opacity-25 disabled:cursor-not-allowed w-10 h-10 md:w-12 md:h-12"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={activeIndex === articoli.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full bg-[rgb(15,23,43)] text-white border-none opacity-70 hover:opacity-100 hover:scale-110 transition-all shadow-lg disabled:opacity-25 disabled:cursor-not-allowed w-10 h-10 md:w-12 md:h-12"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </>
          )}

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-12 px-32"
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            {/* Spacer sinistro per permettere al primo elemento di essere centrato */}
            <div className="flex-shrink-0 w-[110px] md:w-[125px]"></div>

            {articoli.map((articolo, index) => (
              <div
                key={articolo.id}
                className="flex-shrink-0 w-[220px] md:w-[250px] snap-center transition-all duration-300 ease-in-out"
                style={{
                  transform: index === activeIndex ? 'scale(1)' : 'scale(0.85)',
                  opacity: index === activeIndex ? '1' : '0.5',
                  transformOrigin: 'center center'
                }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-[280px] overflow-hidden">
                    <img
                      src={articolo.immagineUrl || '/images/pasta.jpg'}
                      alt={articolo.nome}
                      className="w-full h-full object-cover rounded-t-2xl shadow-lg"
                    />
                    {articolo.eBestChoice && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star size={14} />
                        Best Choice
                      </div>
                    )}
                    {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                      </div>
                    )}
                    {articolo.immagineAiGenerata && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                        <p className="text-[10px] text-white/80 flex items-center justify-center gap-1">
                          <Wand2 className="w-2.5 h-2.5" />
                          Immagine generata con IA
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 text-center">
                    <h3
                      className={`font-bold text-gray-900 mb-2 transition-all duration-300 ${
                        index === activeIndex ? 'text-xl' : 'text-base translate-y-4'
                      }`}
                    >
                      {articolo.nome}
                    </h3>
                    {articolo.descrizione && (
                      <p
                        className={`text-gray-600 transition-all duration-300 ${
                          index === activeIndex ? 'text-sm line-clamp-2 opacity-100' : 'text-xs opacity-0'
                        }`}
                      >
                        {articolo.descrizione}
                      </p>
                    )}
                    <div className={`flex items-center justify-center gap-3 mt-3 transition-all duration-300 ${
                      index === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) ? (
                        <>
                          <span className="text-xl font-bold text-primary">
                            €{articolo.prezzoPromozionale.toFixed(2)}
                          </span>
                          <span className="text-base text-gray-400 line-through">
                            €{articolo.prezzo.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          €{articolo.prezzo.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                      <p className={`text-xs text-gray-500 mt-2 transition-all duration-300 ${
                        index === activeIndex ? 'opacity-100' : 'opacity-0'
                      }`}>
                        Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Spacer destro per permettere all'ultimo elemento di essere centrato */}
            <div className="flex-shrink-0 w-[110px] md:w-[125px]"></div>
          </div>

          {/* Dots/Markers */}
          {articoli.length > 1 && (
            <div className="flex justify-center gap-2">
              {articoli.map((_, index) => (
                <button
                  key={index}
                  className={`h-5 rounded-full transition-all duration-150 ${
                    index === activeIndex ? 'w-5 bg-[rgb(15,23,43)] opacity-100' : 'w-2 bg-[rgb(15,23,43)] opacity-25'
                  }`}
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Vai alla slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}