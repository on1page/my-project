'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Euro, Users, Sparkles, Loader2, MapPin, Share2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ReservationDialog from '@/components/ReservationDialog'

interface Evento {
  id: string
  titolo: string
  slug: string
  descrizione: string
  descrizioneBreve: string
  immagineUrl: string | null
  data: string
  oraInizio: string
  oraFine: string
  prezzo: number
  etichettaPrezzo: string | null
  gratuito: boolean
  graditaPrenotazione: boolean
  capacita: number
  postiDisponibili: number
  location: string | null
  incluso: string[] | null
  infoAggiuntive: string[] | null
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

export default function EventiPage() {
  const [eventi, setEventi] = useState<Evento[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null)
  const [reservationOpen, setReservationOpen] = useState(false)
  const [eventForReservation, setEventForReservation] = useState<Evento | null>(null)
  const [postiRimanenti, setPostiRimanenti] = useState<number | null>(null)

  useEffect(() => {
    fetchEventi()
    fetchBanners()
  }, [])

  // Fetch posti rimanenti quando cambia l'evento selezionato
  useEffect(() => {
    async function fetchPostiRimanenti() {
      if (!selectedEvent || selectedEvent.capacita === 0) {
        setPostiRimanenti(null)
        return
      }

      try {
        const response = await fetch(`/api/eventi/${selectedEvent.id}/posti-rimanenti`)
        if (response.ok) {
          const data = await response.json()
          setPostiRimanenti(data.rimanenti)
        }
      } catch (error) {
        console.error('Errore nel recupero posti rimanenti:', error)
        setPostiRimanenti(selectedEvent.capacita) // Fallback alla capacità totale
      }
    }

    fetchPostiRimanenti()
  }, [selectedEvent])

  async function fetchEventi() {
    setLoading(true)
    try {
      const response = await fetch('/api/eventi')
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

  function handlePrenota() {
    if (!selectedEvent) return
    // Salva l'evento per la prenotazione invece di azzerarlo
    setEventForReservation(selectedEvent)
    setSelectedEvent(null)
    setReservationOpen(true)
  }

  const handleShare = useCallback(async () => {
    if (!selectedEvent) return
    const text = `🎫 ${selectedEvent.titolo}\n📅 ${formatDate(selectedEvent.data)} ore ${selectedEvent.oraInizio}\n${selectedEvent.gratuito ? '🆓 Gratuito' : `💰 €${selectedEvent.prezzo}`}\n${selectedEvent.descrizioneBreve}`
    const url = window.location.href

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: selectedEvent.titolo, text, url })
        return
      } catch {
        // Utente ha annullato o errore, fallback WhatsApp
      }
    }
    // Fallback: WhatsApp
    const encoded = encodeURIComponent(`${text}\n\n${url}`)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }, [selectedEvent, formatDate])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header semplificato */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Torna alla Home</span>
          </Link>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventi e News</h1>
          <p className="text-lg text-gray-600">
            Scopri le nostre serate speciali ed eventi esclusivi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Orizzontale in alto */}
        {banners.filter(b => b.tipo === 'horizontal' && (b.posizione === 'top' || !b.posizione)).map(banner => (
          <div key={banner.id} className="w-full my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6">
              {banner.sponsorLogo && (
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                  <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                {banner.titolo && <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{banner.titolo}</h4>}
                {banner.descrizione && <p className="text-sm text-gray-600">{banner.descrizione}</p>}
              </div>
              {banner.ctaTesto && banner.ctaUrl && (
                <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors text-sm text-center">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun evento trovato</h3>
                <p className="text-gray-500">Al momento non ci sono eventi in programma. Torna presto!</p>
              </div>
            ) : (
              /* Griglia Eventi */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {eventi.map((evento) => (
                  <Card
                    key={evento.id}
                    className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden flex flex-col h-full cursor-pointer ${
                      evento.inEvidenza ? 'ring-2 ring-orange-300' : ''
                    }`}
                    onClick={() => setSelectedEvent(evento)}
                  >
                    {/* Immagine */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {evento.immagineUrl ? (
                        <img src={evento.immagineUrl} alt={evento.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-orange-400" />
                        </div>
                      )}

                      {/* Badges in alto a destra */}
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

                      {/* Badge in basso a sinistra */}
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {evento.gratuito && (
                          <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                            Gratuito
                          </span>
                        )}
                        {evento.graditaPrenotazione && !evento.gratuito && (
                          <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md">
                            Prenotazione consigliata
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenuto */}
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Data e Ora */}
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-600">{formatShortDate(evento.data)}</span>
                        <span className="text-gray-400">•</span>
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-600">{evento.oraInizio}</span>
                      </div>

                      {/* Titolo */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {evento.titolo}
                      </h3>

                      {/* Descrizione breve */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{evento.descrizioneBreve}</p>

                      {/* Footer Card */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {evento.gratuito ? (
                          <span className="text-xl font-bold text-green-600">Gratuito</span>
                        ) : (
                          <div className="flex flex-col">
                            {evento.etichettaPrezzo && (
                              <span className="text-xs text-gray-500">{evento.etichettaPrezzo}</span>
                            )}
                            <span className="text-xl font-bold text-orange-600">€{evento.prezzo}</span>
                          </div>
                        )}

                        <span className="text-sm font-medium text-orange-600 group-hover:gap-2 transition-all flex items-center gap-1">
                          Dettagli
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Banner Inline */}
            {banners.filter(b => b.posizione === 'inline').map(banner => (
              <div key={banner.id} className="my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-6">
                  {banner.sponsorLogo && (
                    <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                      <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                    <h4 className="text-lg font-bold text-gray-900">{banner.titolo}</h4>
                    <p className="text-sm text-gray-600">{banner.descrizione}</p>
                  </div>
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
                      {banner.ctaTesto}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Banner in basso */}
            {banners.filter(b => b.tipo === 'horizontal' && b.posizione === 'bottom').map(banner => (
              <div key={banner.id} className="w-full my-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6">
                  {banner.sponsorLogo && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                      <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-orange-600 font-semibold mb-1">SPONSORIZZATO</p>
                    {banner.titolo && <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{banner.titolo}</h4>}
                    {banner.descrizione && <p className="text-sm text-gray-600">{banner.descrizione}</p>}
                  </div>
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors text-sm text-center">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {selectedEvent && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedEvent.titolo}</DialogTitle>
              </DialogHeader>

              {/* Immagine compatta */}
              <div className="relative h-40 sm:h-48 shrink-0">
                {selectedEvent.immagineUrl ? (
                  <img src={selectedEvent.immagineUrl} alt={selectedEvent.titolo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Calendar className="w-14 h-14 text-orange-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badges immagine */}
                <div className="absolute bottom-3 left-4 flex gap-2">
                  {selectedEvent.gratuito && (
                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">Gratuito</span>
                  )}
                  {selectedEvent.graditaPrenotazione && (
                    <span className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">Prenotazione consigliata</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{selectedEvent.titolo}</h2>

                {/* Meta Info Grid */}
                <div className={`grid gap-4 mb-6 ${selectedEvent.graditaPrenotazione ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
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
                  {!selectedEvent.gratuito && (
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
                  )}

                  {/* Posti - solo se gradita prenotazione */}
                  {selectedEvent.graditaPrenotazione && selectedEvent.capacita > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posti</p>
                        <p className={`font-semibold ${
                          (postiRimanenti ?? selectedEvent.capacita) <= 5 ? 'text-red-600' :
                          (postiRimanenti ?? selectedEvent.capacita) <= 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {postiRimanenti ?? selectedEvent.capacita} disponibili
                        </p>
                        <p className="text-sm text-gray-600">su {selectedEvent.capacita} totali</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                {selectedEvent.location && (
                  <div className="mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{selectedEvent.location}</span>
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
                {Array.isArray(selectedEvent.incluso) && selectedEvent.incluso.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span>✓</span> {selectedEvent.gratuito ? 'Cosa include' : 'Incluso nel prezzo'}
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedEvent.incluso.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info Aggiuntive */}
                {Array.isArray(selectedEvent.infoAggiuntive) && selectedEvent.infoAggiuntive.length > 0 && (
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
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedEvent.graditaPrenotazione ? (
                    <Button className="flex-1" size="lg" onClick={handlePrenota}>
                      {selectedEvent.gratuito ? 'Prenota un posto' : `Prenota ora - €${selectedEvent.prezzo}`}
                    </Button>
                  ) : selectedEvent.gratuito ? (
                    <Button className="flex-1" size="lg" variant="outline" onClick={handlePrenota}>
                      Partecipa all&apos;evento
                    </Button>
                  ) : (
                    <Button className="flex-1" size="lg" onClick={handlePrenota}>
                      Scopri di più - €{selectedEvent.prezzo}
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Condividi
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reservation Dialog */}
      {reservationOpen && eventForReservation && (
        <ReservationDialog
          onClose={() => {
            setReservationOpen(false)
            setEventForReservation(null)
          }}
          eventoId={eventForReservation.id}
          eventoData={eventForReservation.data.split('T')[0]}
          eventoOra={eventForReservation.oraInizio}
          eventoTitolo={eventForReservation.titolo}
        />
      )}
    </div>
  )
}
