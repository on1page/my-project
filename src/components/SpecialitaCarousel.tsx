'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Wand2 } from 'lucide-react'

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

  const isPromoValid = (scadenza: string | null) => {
    if (!scadenza) return false
    return new Date(scadenza) > new Date()
  }

  const scrollNext = () => {
    if (!carouselRef.current) return
    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 250
    carouselRef.current.scrollBy({
      left: itemWidth,
      behavior: 'smooth'
    })
  }

  const scrollPrev = () => {
    if (!carouselRef.current) return
    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 250
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
        <div className="carousel-wrapper relative max-w-[min(calc(100%-2rem),700px)] mx-auto">
          {/* Navigation Buttons */}
          {articoli.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={scrollPrev}
                className="nav-btn nav-btn-prev"
                aria-label="Precedente"
              >
                ❮
              </button>

              {/* Next Button */}
              <button
                onClick={scrollNext}
                className="nav-btn nav-btn-next"
                aria-label="Successivo"
              >
                ❯
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="carousel"
          >
            {/* Left Spacer */}
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
                      <Star size={14} />
                      <span>Best Choice</span>
                    </div>
                  )}
                  {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                    <div className="badge badge-promo font-bold">
                      -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                    </div>
                  )}
                  {articolo.immagineAiGenerata && (
                    <div className="ai-badge">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Immagine generata con IA</span>
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
                  <p className="promo-expiry text-xs text-gray-500 mt-1">
                    Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                  </p>
                )}
              </article>
            ))}

            {/* Right Spacer */}
            <div className="carousel-spacer" aria-hidden="true" />
          </div>

          {/* Markers */}
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
        .carousel-wrapper {
          padding-block: 2rem;
        }

        .carousel {
          display: flex;
          gap: 0;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          overscroll-behavior-x: contain;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .carousel::-webkit-scrollbar {
          display: none;
        }

        .carousel-spacer {
          flex: 0 0 1px;
          min-width: calc(50% - 125px);
        }

        .carousel-item {
          flex: 0 0 auto;
          width: 250px;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          position: relative;
          display: grid;
          grid-template-areas:
            'img'
            'title'
            'desc'
            'price'
            'promo';
          text-align: center;
          cursor: pointer;
          transition: all 300ms ease-in-out;
          container-type: inline-size;
          container-name: card;
        }

        /* Active item styling */
        .carousel-item.active .carousel-img {
          scale: 1;
          opacity: 1;
        }

        .carousel-item.active .carousel-title {
          scale: 1;
          opacity: 1;
          transform: translateY(0);
        }

        .carousel-item.active .carousel-desc {
          scale: 1;
          opacity: 1;
        }

        .carousel-item.active .carousel-price {
          scale: 1;
          opacity: 1;
        }

        /* Inactive item styling - scale down */
        .carousel-item:not(.active) .carousel-img {
          scale: 0.5;
          opacity: 0.5;
        }

        .carousel-item:not(.active) .carousel-title {
          scale: 0.5;
          opacity: 0.5;
          transform: translateY(-100px);
        }

        .carousel-item:not(.active) .carousel-desc {
          scale: 0.5;
          opacity: 0;
        }

        .carousel-item:not(.active) .carousel-price {
          scale: 0.5;
          opacity: 0;
        }

        .carousel-item:not(.active) .promo-expiry {
          opacity: 0;
        }

        .carousel-item:not(.active) .badge {
          opacity: 0.5;
        }

        .carousel-img {
          grid-area: img;
          width: 100%;
          aspect-ratio: 3/4;
          transition: all 300ms ease-in-out;
          transform-origin: center center;
          position: relative;
          overflow: hidden;
          border-radius: 1.25rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
          margin-bottom: 1rem;
        }

        .carousel-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .carousel-item:hover .carousel-img img {
          transform: scale(1.05);
        }

        .badge {
          position: absolute;
          top: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: opacity 300ms ease-in-out;
        }

        .badge-best {
          left: 0.75rem;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .badge-promo {
          right: 0.75rem;
          background-color: rgb(220, 38, 38);
          color: white;
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
          margin: 1rem 0 0.25rem 0;
          font-size: 1.3rem;
          font-weight: bold;
          color: rgb(15, 23, 43);
          white-space: nowrap;
          transition: all 300ms ease-in-out;
        }

        .carousel-desc {
          grid-area: desc;
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: rgb(75, 85, 99);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 300ms ease-in-out;
        }

        .carousel-price {
          grid-area: price;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 300ms ease-in-out;
        }

        .price-current {
          font-size: 1.25rem;
          font-weight: bold;
          color: hsl(var(--primary));
        }

        .price-original {
          font-size: 1rem;
          color: rgb(156, 163, 175);
          text-decoration: line-through;
        }

        .price-normal {
          font-size: 1.25rem;
          font-weight: bold;
          color: rgb(15, 23, 43);
        }

        /* Navigation Buttons */
        .nav-btn {
          position: absolute;
          width: 40px;
          aspect-ratio: 1/1;
          font: inherit;
          background-color: rgb(15, 23, 43);
          display: grid;
          place-content: center;
          color: white;
          border: none;
          border-radius: 50%;
          opacity: 0.7;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          outline: 1px dashed transparent;
          outline-offset: 0px;
          z-index: 20;
          top: 50%;
          transform: translateY(-50%);
        }

        .nav-btn-prev {
          left: calc(40px * -0.5);
        }

        .nav-btn-next {
          right: calc(40px * -0.5);
        }

        .nav-btn:hover,
        .nav-btn:focus-visible {
          opacity: 1;
          scale: 1.1;
        }

        .nav-btn:focus-visible {
          outline: 1px dashed rgb(15, 23, 43);
          outline-offset: 4px;
        }

        .nav-btn:disabled {
          opacity: 0.25;
          cursor: unset;
        }

        /* Markers */
        .carousel-markers {
          position: absolute;
          width: min(90%, 400px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding-block-start: 1rem;
          left: calc(50% - min(45%, 200px));
          right: calc(50% - min(45%, 200px));
          bottom: 0;
        }

        .carousel-marker {
          width: 20px;
          aspect-ratio: 1;
          background-color: rgb(15, 23, 43);
          border-radius: 50%;
          transition: 150ms ease-in-out;
          cursor: pointer;
          border: none;
          padding: 0;
          opacity: 0.25;
          scale: 0.75;
        }

        .carousel-marker.active {
          opacity: 1;
          scale: 1;
        }

        .carousel-marker:hover {
          opacity: 1;
        }

        .carousel-marker:focus-visible {
          outline: 1px dashed rgb(15, 23, 43);
          outline-offset: 4px;
        }

        /* Responsive - Mobile */
        @media (max-width: 640px) {
          .carousel-spacer {
            min-width: calc(50% - 75px);
          }

          .carousel-item {
            width: 150px;
          }

          .carousel-title {
            font-size: 1rem;
          }

          .carousel-desc {
            font-size: 0.75rem;
          }

          .price-current,
          .price-normal {
            font-size: 1rem;
          }

          .price-original {
            font-size: 0.875rem;
          }

          .badge {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }

          /* Hide nav buttons on mobile to prevent overlap */
          .nav-btn {
            display: none;
          }
        }

        /* Responsive - Tablet */
        @media (min-width: 641px) and (max-width: 1023px) {
          .carousel-item {
            width: 220px;
          }

          .carousel-spacer {
            min-width: calc(50% - 110px);
          }
        }

        /* Responsive - Desktop */
        @media (min-width: 1024px) {
          .carousel-item {
            width: 250px;
          }
        }

        /* Touch device improvements */
        @media (hover: none) and (pointer: coarse) {
          .carousel {
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