'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Wand2, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef(0)
  const scrollPos = useRef(0)

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

  // Track active card based on scroll position
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleScroll = () => {
      const items = carousel.querySelectorAll('.carousel-item')
      const center = carousel.scrollLeft + carousel.offsetWidth / 2

      let closestIndex = 0
      let closestDistance = Infinity

      items.forEach((item, index) => {
        const itemCenter = item.getBoundingClientRect().left + item.getBoundingClientRect().width / 2
        const distance = Math.abs(center - itemCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveIndex(closestIndex)
    }

    carousel.addEventListener('scroll', handleScroll, { passive: true })
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [articoli])

  // Touch/drag handling for better mobile experience
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    isDragging.current = true
    startPos.current = e.pageX - carouselRef.current.offsetLeft
    scrollPos.current = carouselRef.current.scrollLeft
    carouselRef.current.style.cursor = 'grabbing'
  }

  const handleMouseUp = () => {
    if (!carouselRef.current) return
    isDragging.current = false
    carouselRef.current.style.cursor = 'grab'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startPos.current) * 2
    carouselRef.current.scrollLeft = scrollPos.current - walk
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return
    isDragging.current = true
    startPos.current = e.touches[0].pageX - carouselRef.current.offsetLeft
    scrollPos.current = carouselRef.current.scrollLeft
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !carouselRef.current) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startPos.current) * 2
    carouselRef.current.scrollLeft = scrollPos.current - walk
  }

  const isPromoValid = (scadenza: string | null) => {
    if (!scadenza) return false
    return new Date(scadenza) > new Date()
  }

  const scrollNext = () => {
    if (!carouselRef.current) return
    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 220
    carouselRef.current.scrollBy({
      left: itemWidth,
      behavior: 'smooth'
    })
  }

  const scrollPrev = () => {
    if (!carouselRef.current) return
    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 220
    carouselRef.current.scrollBy({
      left: -itemWidth,
      behavior: 'smooth'
    })
  }

  const goToSlide = (index: number) => {
    if (!carouselRef.current) return
    const item = carouselRef.current.querySelectorAll('.carousel-item')[index]
    if (item) {
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }

  if (loading) {
    return (
      <section id="specialita" className="py-12 md:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                  <div className="aspect-[3/4] bg-gray-300 rounded-lg mb-4"></div>
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
    <section id="specialita" className="py-12 md:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation - Desktop */}
          {articoli.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={scrollPrev}
                className="absolute left-0 md:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100 -ml-4 md:ml-0"
                aria-label="Precedente"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={scrollNext}
                className="absolute right-0 md:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 hover:scale-110 opacity-80 hover:opacity-100 -mr-4 md:mr-0"
                aria-label="Successivo"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="carousel-container"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {/* Left spacer for center snap */}
            <div className="carousel-spacer" aria-hidden="true" />

            {/* Items */}
            {articoli.map((articolo, index) => (
              <article
                key={articolo.id}
                className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  window.location.href = `/menu?articolo=${articolo.id}`
                }}
              >
                {/* Image */}
                <div className="carousel-img">
                  <img
                    src={articolo.immagineUrl || '/images/pasta.jpg'}
                    alt={articolo.nome}
                    loading={index > 2 ? 'lazy' : 'eager'}
                  />
                  {articolo.eBestChoice && (
                    <div className="badge badge-best">
                      <Star size={12} className="md:w-3 md:h-3 lg:w-4 lg:h-4" />
                      <span className="text-xs md:text-sm lg:text-base">Best Choice</span>
                    </div>
                  )}
                  {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                    <div className="badge badge-promo text-xs md:text-sm font-bold">
                      -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                    </div>
                  )}
                  {articolo.immagineAiGenerata && (
                    <div className="ai-badge">
                      <Wand2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="text-[10px] md:text-xs">Immagine generata con IA</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="carousel-title">{articolo.nome}</h2>

                {/* Description */}
                {articolo.descrizione && (
                  <p className="carousel-desc">{articolo.descrizione}</p>
                )}

                {/* Price */}
                <div className="carousel-price">
                  {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) ? (
                    <>
                      <span className="price-current">€{articolo.prezzoPromozionale.toFixed(2)}</span>
                      <span className="price-original">€{articolo.prezzo.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="price-normal">€{articolo.prezzo.toFixed(2)}</span>
                  )}
                </div>

                {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                  <p className="promo-expiry text-xs">
                    Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                  </p>
                )}
              </article>
            ))}

            {/* Right spacer for center snap */}
            <div className="carousel-spacer" aria-hidden="true" />
          </div>

          {/* Markers/Dots */}
          {articoli.length > 1 && (
            <div className="carousel-markers">
              {articoli.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-marker ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Vai alla slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .carousel-container {
          display: flex;
          align-items: center;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
          padding: 1.5rem 0;
          gap: 0;
          touch-action: pan-x;
        }

        .carousel-container::-webkit-scrollbar {
          display: none;
        }

        .carousel-spacer {
          flex: 0 0 1px;
          min-width: min(calc(50% - 100px), calc(50% - 140px));
        }

        @media (min-width: 640px) {
          .carousel-spacer {
            min-width: calc(50% - 130px);
          }
        }

        @media (min-width: 768px) {
          .carousel-spacer {
            min-width: calc(50% - 140px);
          }
        }

        @media (min-width: 1024px) {
          .carousel-spacer {
            min-width: calc(50% - 160px);
          }
        }

        .carousel-item {
          flex: 0 0 auto;
          width: 200px;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          display: grid;
          grid-template-areas:
            'img'
            'title'
            'desc'
            'price'
            'promo';
          text-align: center;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 300ms ease-in-out;
        }

        @media (min-width: 640px) {
          .carousel-item {
            width: 260px;
            padding: 0.75rem;
          }
        }

        @media (min-width: 768px) {
          .carousel-item {
            width: 220px;
          }
        }

        @media (min-width: 1024px) {
          .carousel-item {
            width: 260px;
          }
        }

        .carousel-item.active .carousel-img {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .carousel-item.active .carousel-title {
          transform: scale(1.02);
        }

        .carousel-img {
          grid-area: img;
          width: 100%;
          aspect-ratio: 3/4;
          transition: all 300ms ease-in-out;
          transform-origin: center center;
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
          margin-bottom: 0.75rem;
        }

        .carousel-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .carousel-item:hover .carousel-img img {
          transform: scale(1.1);
        }

        .badge {
          position: absolute;
          top: 0.5rem;
          padding: 0.25rem 0.5rem md:px-3 md:py-1;
          border-radius: 9999px;
          font-weight: 500;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        @media (min-width: 768px) {
          .badge {
            top: 0.75rem;
            padding: 0.25rem 0.75rem;
          }
        }

        .badge-best {
          left: 0.5rem;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        @media (min-width: 768px) {
          .badge-best {
            left: 0.75rem;
          }
        }

        .badge-promo {
          right: 0.5rem;
          background-color: rgb(220, 38, 38);
          color: white;
        }

        @media (min-width: 768px) {
          .badge-promo {
            right: 0.75rem;
          }
        }

        .ai-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          padding: 0.25rem 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .carousel-title {
          grid-area: title;
          margin: 0.5rem 0 0.25rem 0;
          font-size: 1rem;
          font-weight: bold;
          color: rgb(15, 23, 43);
          line-height: 1.2;
          transition: all 300ms ease-in-out;
        }

        @media (min-width: 640px) {
          .carousel-title {
            font-size: 1.125rem;
            margin: 0.75rem 0 0.25rem 0;
          }
        }

        @media (min-width: 768px) {
          .carousel-title {
            font-size: 1.25rem;
            margin: 1rem 0 0.25rem 0;
          }
        }

        .carousel-desc {
          grid-area: desc;
          margin: 0 0 0.5rem 0;
          font-size: 0.75rem;
          color: rgb(75, 85, 99);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        @media (min-width: 640px) {
          .carousel-desc {
            font-size: 0.875rem;
          }
        }

        @media (min-width: 768px) {
          .carousel-desc {
            white-space: nowrap;
            -webkit-line-clamp: 1;
          }
        }

        .carousel-price {
          grid-area: price;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .price-current {
          font-size: 1.125rem;
          font-weight: bold;
          color: hsl(var(--primary));
        }

        @media (min-width: 640px) {
          .price-current {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 768px) {
          .price-current {
            font-size: 1.5rem;
          }
        }

        .price-original {
          font-size: 0.875rem;
          color: rgb(156, 163, 175);
          text-decoration: line-through;
        }

        @media (min-width: 640px) {
          .price-original {
            font-size: 1rem;
          }
        }

        @media (min-width: 768px) {
          .price-original {
            font-size: 1.125rem;
          }
        }

        .price-normal {
          font-size: 1.125rem;
          font-weight: bold;
          color: rgb(15, 23, 43);
        }

        @media (min-width: 640px) {
          .price-normal {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 768px) {
          .price-normal {
            font-size: 1.5rem;
          }
        }

        .promo-expiry {
          grid-area: promo;
          font-size: 0.6875rem;
          color: rgb(107, 114, 128);
          margin-top: 0.25rem;
        }

        @media (min-width: 640px) {
          .promo-expiry {
            font-size: 0.75rem;
          }
        }

        /* Markers */
        .carousel-markers {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0;
          z-index: 20;
        }

        .carousel-marker {
          width: 8px;
          height: 8px;
          background-color: var(--nav-marker-bg, rgb(15, 23, 43));
          border-radius: 50%;
          transition: all 200ms ease-in-out;
          cursor: pointer;
          border: none;
          padding: 0;
          opacity: 0.3;
        }

        @media (min-width: 640px) {
          .carousel-marker {
            width: 10px;
            height: 10px;
          }
        }

        .carousel-marker.active {
          width: 24px;
          opacity: 1;
          border-radius: 9999px;
        }

        @media (min-width: 640px) {
          .carousel-marker.active {
            width: 28px;
          }
        }

        @media (min-width: 768px) {
          .carousel-marker.active {
            width: 32px;
          }
        }

        .carousel-marker:hover {
          opacity: 1;
          width: 20px;
        }

        @media (min-width: 640px) {
          .carousel-marker:hover {
            width: 24px;
          }
        }

        .carousel-marker:focus-visible {
          outline: 2px solid rgb(15, 23, 43);
          outline-offset: 2px;
        }

        /* Improve touch scrolling on mobile */
        @media (hover: none) and (pointer: coarse) {
          .carousel-container {
            scroll-behavior: auto;
            -webkit-overflow-scrolling: touch;
          }

          .carousel-item {
            scroll-snap-stop: normal;
          }
        }
      `}</style>
    </section>
  )
}