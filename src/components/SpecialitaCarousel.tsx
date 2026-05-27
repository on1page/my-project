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

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [articoli])

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
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="carousel-container">
          <section
            ref={carouselRef}
            className="carousel"
          >
            {/* Empty pseudo elements - represented as invisible divs */}
            <div className="carousel-spacer" aria-hidden="true"></div>

            {articoli.map((articolo, index) => (
              <article
                key={articolo.id}
                className={`carousel-item ${index === 0 ? 'scroll-start' : ''} ${index === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  window.location.href = `/menu?articolo=${articolo.id}`
                }}
              >
                {/* Immagine */}
                <div className="carousel-img">
                  <img
                    src={articolo.immagineUrl || '/images/pasta.jpg'}
                    alt={articolo.nome}
                  />
                  {articolo.eBestChoice && (
                    <div className="badge badge-best">
                      <Star size={14} />
                      Best Choice
                    </div>
                  )}
                  {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                    <div className="badge badge-promo">
                      -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                    </div>
                  )}
                  {articolo.immagineAiGenerata && (
                    <div className="ai-badge">
                      <Wand2 className="w-2.5 h-2.5" />
                      Immagine generata con IA
                    </div>
                  )}
                </div>

                {/* Titolo */}
                <h2 className="carousel-title">{articolo.nome}</h2>

                {/* Descrizione */}
                {articolo.descrizione && (
                  <p className="carousel-desc">{articolo.descrizione}</p>
                )}

                {/* Prezzo */}
                <div className="carousel-price">
                  {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) ? (
                    <>
                      <span className="price-current">
                        €{articolo.prezzoPromozionale.toFixed(2)}
                      </span>
                      <span className="price-original">
                        €{articolo.prezzo.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="price-normal">
                      €{articolo.prezzo.toFixed(2)}
                    </span>
                  )}
                </div>

                {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                  <p className="promo-expiry">
                    Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                  </p>
                )}
              </article>
            ))}

            {/* Empty pseudo element at the end */}
            <div className="carousel-spacer" aria-hidden="true"></div>
          </section>

          {/* Navigation Arrows */}
          {articoli.length > 1 && (
            <>
              <button
                className="nav-btn nav-btn-prev"
                onClick={() => {
                  if (carouselRef.current) {
                    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 220
                    carouselRef.current.scrollBy({
                      left: -itemWidth,
                      behavior: 'smooth'
                    })
                  }
                }}
                aria-label="Precedente"
              >
                ❮
              </button>
              <button
                className="nav-btn nav-btn-next"
                onClick={() => {
                  if (carouselRef.current) {
                    const itemWidth = carouselRef.current.querySelector('.carousel-item')?.getBoundingClientRect().width || 220
                    carouselRef.current.scrollBy({
                      left: itemWidth,
                      behavior: 'smooth'
                    })
                  }
                }}
                aria-label="Successivo"
              >
                ❯
              </button>
            </>
          )}

          {/* Dots/Markers */}
          {articoli.length > 1 && (
            <div className="carousel-markers">
              {articoli.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-marker ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => {
                    if (carouselRef.current) {
                      const item = carouselRef.current.querySelectorAll('.carousel-item')[index]
                      if (item) {
                        item.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'center'
                        })
                      }
                    }
                  }}
                  aria-label={`Vai alla slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .carousel-container {
          --nav-btn-size: 40px;
          --nav-btn-bg: rgb(15, 23, 43);
          --nav-marker-bg: rgb(15, 23, 43);
          --card-width: 220px;
          --card-ratio: 3/4;

          width: min(calc(100% - 2rem), 700px);
          margin: 0 auto;
          position: relative;
          padding-block: 2rem;
        }

        .carousel {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          overscroll-behavior-x: contain;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-padding-inline: max(calc(50% - var(--card-width) / 2), 0);
        }

        .carousel::-webkit-scrollbar {
          display: none;
        }

        .carousel-spacer {
          flex: 0 0 1px;
          min-width: calc(50% - var(--card-width) / 2);
        }

        .carousel-item {
          flex: 0 0 var(--card-width);
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
          container-type: inline-size;
          container-name: card;

          &.scroll-start {
            scroll-margin-inline: auto;
          }

          /* Inactive items */
          &:not(.active) {
            .carousel-img {
              scale: 0.75;
              opacity: 0.5;
            }

            .carousel-title {
              scale: 0.75;
              opacity: 0.5;
              translate: 0 -50px;
            }

            .carousel-desc {
              scale: 0.75;
              opacity: 0;
            }

            .carousel-price,
            .promo-expiry {
              opacity: 0;
            }
          }
        }

        .carousel-img {
          grid-area: img;
          width: 100%;
          aspect-ratio: var(--card-ratio);
          transition: all 300ms ease-in-out;
          transform-origin: center center;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0 10px 20px rgba(0 0 0 / 0.25);

          & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 300ms ease;
          }

          &:hover img {
            transform: scale(1.05);
          }
        }

        .badge {
          position: absolute;
          top: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 10;
        }

        .badge-best {
          left: 0.75rem;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .badge-promo {
          right: 0.75rem;
          background-color: rgb(220, 38, 38);
          color: white;
          font-weight: 700;
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

          p {
            font-size: 0.625rem;
            color: rgba(255, 255, 255, 0.8);
          }
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

        .promo-expiry {
          grid-area: promo;
          font-size: 0.75rem;
          color: rgb(107, 114, 128);
          margin-top: 0.25rem;
          transition: all 300ms ease-in-out;
        }

        /* Navigation Buttons */
        .nav-btn {
          position: absolute;
          width: var(--nav-btn-size);
          aspect-ratio: 1/1;
          font: inherit;
          background-color: var(--nav-btn-bg);
          display: grid;
          place-content: center;
          color: #FFF;
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
          left: calc(var(--nav-btn-size) * -0.5);
        }

        .nav-btn-next {
          right: calc(var(--nav-btn-size) * -0.5);
        }

        .nav-btn:hover,
        .nav-btn:focus-visible {
          opacity: 1;
          scale: 1.1;
        }

        .nav-btn:focus-visible {
          outline: 1px dashed var(--nav-btn-bg);
          outline-offset: 4px;
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
        }

        .carousel-marker {
          content: ' ';
          height: 20px;
          width: 5px;
          aspect-ratio: 1;
          background-color: var(--nav-marker-bg);
          border-radius: 50%;
          transition: all 150ms ease-in-out;
          cursor: pointer;
          border: none;
          padding: 0;
          opacity: 0.25;

          &.active {
            width: 20px;
            opacity: 1;
          }
        }

        .carousel-marker:hover {
          opacity: 1;
        }

        .carousel-marker:focus-visible {
          outline: 1px dashed var(--nav-marker-bg);
          outline-offset: 4px;
        }

        /* Active marker styling handled by scroll position tracking */
        @media (hover: hover) {
          .carousel-marker:hover {
            width: 20px;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  )
}