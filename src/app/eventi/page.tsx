'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Euro, Users, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Evento {
  id: string
  titolo: string
  slug: string
  descrizione: string
  descrizioneBreve: string
  categoria: string
  immagineUrl: string | null
  data: string
  oraInizio: string
  oraFine: string
  prezzo: number
  etichettaPrezzo: string | null
  capacita: number
  postiDisponibili: number
  location: string | null
  incluso: string[] | null
  infoAggiuntive: string[] | null
  stato: string
  inEvidenza: boolean
  nuovo: boolean
}

interface Banner {
  id: string
  tipo: string
  posizione: string
  sponsorNome: string
  sponsorLogo: string | null
  sponsorUrl: string
  titolo: string | null
  descrizione: string | null
  ctaTesto: string | null
  ctaUrl: string | null
  immagineUrl: string | null
  coloreSfondo: string | null
}

const CATEGORIE = [
  { value: 'all', label: 'Tutti gli eventi' },
  { value: 'degustazioni', label: '🍷 Degustazioni' },
  { value: 'serate-tema', label: '🎉 Serate a tema' },
  { value: 'live-music', label: '🎵 Live Music' },
  { value: 'eventi-speciali', label: '✨ Eventi Speciali' },
  { value: 'corsi-cucina', label: '👨‍🍳 Corsi di Cucina' }
]

export default function EventiPage() {
  const [eventi, setEventi] = useState<Evento[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null)

  useEffect(() => {
    fetchEventi()
    fetchBanners()
  }, [selectedCategory])

  async function fetchEventi() {
    setLoading(true)
    try {
      const url = selectedCategory === 'all'
        ? '/api/eventi'
        : `/api/eventi?categoria=${selectedCategory}`

      const response = await fetch(url)
      const result = await response.json()
      setEventi(result.data || [])
    } catch (error) {
      console.error('Errore nel recupero eventi:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchBanners() {
    try {
      const response = await fetch('/api/banners?pagina=eventi')
      const result = await response.json()
      setBanners(result.data || [])
    } catch (error) {
      console.error('Errore nel recupero banner:', error)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short'
    })
  }

  function getStatusLabel(stato: string) {
    switch (stato) {
      case 'available': return { label: 'Disponibile', className: 'bg-green-100 text-green-700' }
      case 'limited': return { label: 'Posti limitati', className: 'bg-yellow-100 text-yellow-700' }
      case 'sold-out': return { label: 'Sold Out', className: 'bg-red-100 text-red-700' }
      default: return { label: stato, className: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventi & Specialità</h1>
          <p className="text-lg text-gray-600">
            Scopri le nostre serate speciali, degustazioni ed eventi esclusivi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtri Categorie */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-4 mb-8 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {CATEGORIE.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`filter-chip px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Orizzontale */}
        {banners.filter(b => b.tipo === 'horizontal' && (b.posizione === 'top' || !b.posizione)).map(banner => (
          <div
            key={banner.id}
            className="w-full my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6">
              {banner.sponsorLogo && (
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                  <img
                    src={banner.sponsorLogo}
                    alt={banner.sponsorNome}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                {banner.titolo && (
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {banner.titolo}
                  </h4>
                )}
                {banner.descrizione && (
                  <p className="text-sm text-gray-600">{banner.descrizione}</p>
                )}
              </div>
              {banner.ctaTesto && banner.ctaUrl && (
                <a
                  href={banner.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors text-sm text-center"
                >
                  {banner.ctaTesto}
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Nessun evento */}
            {eventi.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nessun evento trovato
                </h3>
                <p className="text-gray-500">
                  {selectedCategory === 'all'
                    ? 'Al momento non ci sono eventi in programma. Torna presto!'
                    : 'Nessun evento in questa categoria.'}
                </p>
              </div>
            ) : (
              /* Griglia Eventi */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {eventi.map((evento) => {
                  const status = getStatusLabel(evento.stato)

                  return (
                    <Card
                      key={evento.id}
                      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden flex flex-col h-full ${
                        evento.inEvidenza ? 'ring-2 ring-orange-300' : ''
                      }`}
                    >
                      {/* Immagine */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {evento.immagineUrl ? (
                          <img
                            src={evento.immagineUrl}
                            alt={evento.titolo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-orange-400" />
                          </div>
                        )}

                        {/* Badge Categoria */}
                        <span className="absolute top-4 left-4 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-md">
                          {CATEGORIE.find(c => c.value === evento.categoria)?.label?.split(' ')[1] || evento.categoria}
                        </span>

                        {/* Badges speciali */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {evento.nuovo && (
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-md">
                              🔥 Nuovo
                            </span>
                          )}
                          {evento.inEvidenza && (
                            <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              In evidenza
                            </span>
                          )}
                        </div>

                        {/* Badge stato */}
                        <div className="absolute bottom-4 left-4">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-md ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Contenuto */}
                      <div className="p-5 flex flex-col flex-grow">
                        {/* Data */}
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600">
                            {formatShortDate(evento.data)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600">
                            {evento.oraInizio}
                          </span>
                        </div>

                        {/* Titolo */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {evento.titolo}
                        </h3>

                        {/* Descrizione breve */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                          {evento.descrizioneBreve}
                        </p>

                        {/* Footer Card */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {/* Prezzo */}
                          <div className="flex flex-col">
                            {evento.etichettaPrezzo && (
                              <span className="text-xs text-gray-500">{evento.etichettaPrezzo}</span>
                            )}
                            <span className="text-xl font-bold text-orange-600">
                              €{evento.prezzo}
                            </span>
                          </div>

                          {/* Pulsante Dettagli */}
                          <Button
                            onClick={() => setSelectedEvent(evento)}
                            className="gap-2"
                            disabled={evento.stato === 'sold-out'}
                          >
                            <span>{evento.stato === 'sold-out' ? 'Esaurito' : 'Dettagli'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Banner Inserito */}
            {banners.filter(b => b.posizione === 'inline').map((banner, idx) => (
              <div
                key={banner.id}
                className="col-span-full my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 p-6">
                  {banner.sponsorLogo && (
                    <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                      <img
                        src={banner.sponsorLogo}
                        alt={banner.sponsorNome}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                    <h4 className="text-lg font-bold text-gray-900">{banner.titolo}</h4>
                    <p className="text-sm text-gray-600">{banner.descrizione}</p>
                  </div>
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a
                      href={banner.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
                    >
                      {banner.ctaTesto}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Banner Orizzontale in basso */}
            {banners.filter(b => b.tipo === 'horizontal' && b.posizione === 'bottom').map(banner => (
              <div
                key={banner.id}
                className="w-full my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6">
                  {banner.sponsorLogo && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                      <img
                        src={banner.sponsorLogo}
                        alt={banner.sponsorNome}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                    {banner.titolo && (
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        {banner.titolo}
                      </h4>
                    )}
                    {banner.descrizione && (
                      <p className="text-sm text-gray-600">{banner.descrizione}</p>
                    )}
                  </div>
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a
                      href={banner.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors text-sm text-center"
                    >
                      {banner.ctaTesto}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Dialog Dettagli Evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedEvent && (
            <>
              {/* Header con Immagine */}
              <div className="relative aspect-[21/9] sm:aspect-[16/9] shrink-0">
                {selectedEvent.immagineUrl ? (
                  <img
                    src={selectedEvent.immagineUrl}
                    alt={selectedEvent.titolo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-orange-400" />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Badge Categoria */}
                <span className="absolute bottom-4 left-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded-full shadow-lg">
                  {CATEGORIE.find(c => c.value === selectedEvent.categoria)?.label?.split(' ')[1] || selectedEvent.categoria}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {/* Titolo */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {selectedEvent.titolo}
                </h2>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Data */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedEvent.data)}</p>
                      <p className="text-sm text-gray-600">{selectedEvent.oraInizio} - {selectedEvent.oraFine}</p>
                    </div>
                  </div>

                  {/* Prezzo */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Euro className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Prezzo</p>
                      <p className="font-semibold text-gray-900">€{selectedEvent.prezzo}</p>
                      {selectedEvent.etichettaPrezzo && (
                        <p className="text-sm text-gray-600">{selectedEvent.etichettaPrezzo}</p>
                      )}
                    </div>
                  </div>

                  {/* Posti */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Disponibilità</p>
                      <p className={`font-semibold ${
                        selectedEvent.postiDisponibili <= 5 ? 'text-red-600' :
                        selectedEvent.postiDisponibili <= 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {selectedEvent.stato === 'sold-out' ? 'Esaurito' : `${selectedEvent.postiDisponibili} posti`}
                      </p>
                      <p className="text-sm text-gray-600">su {selectedEvent.capacita} totali</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {selectedEvent.location && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                    <p className="text-lg font-medium text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}

                {/* Descrizione */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Descrizione</h3>
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {selectedEvent.descrizione.split('\n').map((para, idx) => (
                      <p key={idx} className="mb-3">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Incluso */}
                {selectedEvent.incluso && selectedEvent.incluso.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span>✓</span> Incluso nel prezzo
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedEvent.incluso.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info Aggiuntive */}
                {selectedEvent.infoAggiuntive && selectedEvent.infoAggiuntive.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Info aggiuntive</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedEvent.infoAggiuntive.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer con CTA */}
              <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={selectedEvent.stato === 'sold-out'}
                  >
                    {selectedEvent.stato === 'sold-out' ? 'Posti esauriti' : `Prenota ora - €${selectedEvent.prezzo}`}
                  </Button>
                  <Button variant="outline" size="lg">
                    Condividi evento
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Cancellazione gratuita fino a 48 ore prima dell'evento
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
