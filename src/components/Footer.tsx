'use client'

import { useEffect, useState } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Utensils
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FooterInfo {
  indirizzo?: string
  citta?: string
  cap?: string
  provincia?: string
  latitudine?: number | null
  longitudine?: number | null
  orariApertura?: string | null
  giorniChiusura?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
  justeatUrl?: string | null
  deliverooUrl?: string | null
  glovoUrl?: string | null
  ubereatsUrl?: string | null
}

export default function Footer() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({})

  useEffect(() => {
    async function fetchFooterInfo() {
      try {
        const response = await fetch('/api/admin/footer')
        if (response.ok) {
          const data = await response.json()
          setFooterInfo(data)
        }
      } catch (error) {
        console.error('Errore nel recupero footer info:', error)
      }
    }

    fetchFooterInfo()
  }, [])

  const getAddressString = () => {
    const parts = [footerInfo.indirizzo, footerInfo.cap, footerInfo.citta, footerInfo.provincia]
    return parts.filter(Boolean).join(', ')
  }

  const getDirectionsUrl = () => {
    if (footerInfo.latitudine && footerInfo.longitudine) {
      return `https://www.google.com/maps/dir/?api=1&destination=${footerInfo.latitudine},${footerInfo.longitudine}`
    }
    const address = getAddressString()
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  const parseOrari = () => {
    if (!footerInfo.orariApertura) return []
    try {
      return JSON.parse(footerInfo.orariApertura)
    } catch {
      return []
    }
  }

  const parseGiorniChiusura = () => {
    if (!footerInfo.giorniChiusura) return []
    try {
      return JSON.parse(footerInfo.giorniChiusura)
    } catch {
      return []
    }
  }

  const orari = parseOrari()
  const giorniChiusura = parseGiorniChiusura()

  const deliveryApps = [
    { name: 'Just Eat', url: footerInfo.justeatUrl, icon: Utensils },
    { name: 'Deliveroo', url: footerInfo.deliverooUrl, icon: Utensils },
    { name: 'Glovo', url: footerInfo.glovoUrl, icon: Utensils },
    { name: 'Uber Eats', url: footerInfo.ubereatsUrl, icon: Utensils }
  ].filter(app => app.url)

  const socialLinks = [
    { name: 'Facebook', url: footerInfo.facebookUrl, icon: Facebook },
    { name: 'Instagram', url: footerInfo.instagramUrl, icon: Instagram },
    { name: 'Twitter', url: footerInfo.twitterUrl, icon: Twitter },
    { name: 'LinkedIn', url: footerInfo.linkedinUrl, icon: Linkedin }
  ].filter(social => social.url)

  return (
    <footer id="contatti" className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Mappa */}
          {(footerInfo.indirizzo || footerInfo.citta) && (
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-orange-500" />
                Dove Trovarci
              </h3>
              <div className="bg-gray-800 rounded-xl overflow-hidden mb-4">
                {footerInfo.latitudine && footerInfo.longitudine ? (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${footerInfo.latitudine},${footerInfo.longitudine}&z=15&output=embed`}
                    className="border-0"
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(getAddressString())}&z=15&output=embed`}
                    className="border-0"
                  />
                )}
              </div>
              <p className="text-gray-300 mb-4">{getAddressString()}</p>
              <Button
                onClick={() => window.open(getDirectionsUrl(), '_blank')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Ottieni Indicazioni
              </Button>
            </div>
          )}

          {/* Orari */}
          {(orari.length > 0 || giorniChiusura.length > 0) && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="text-orange-500" />
                Orari
              </h3>
              <div className="space-y-2">
                {orari.map((orario: any, index: number) => (
                  <div key={index} className="flex justify-between text-gray-300">
                    <span>{orario.giorno}</span>
                    <span className="text-white font-medium">{orario.orario}</span>
                  </div>
                ))}
                {giorniChiusura.length > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Chiuso: {giorniChiusura.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contatti e Delivery */}
          <div>
            {footerInfo.telefono || footerInfo.email ? (
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Phone className="text-orange-500" />
                Contatti
              </h3>
            ) : null}
            <div className="space-y-3 mb-6">
              {footerInfo.telefono && (
                <a
                  href={`tel:${footerInfo.telefono}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {footerInfo.telefono}
                </a>
              )}
              {footerInfo.email && (
                <a
                  href={`mailto:${footerInfo.email}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {footerInfo.email}
                </a>
              )}
            </div>

            {/* Delivery Apps */}
            {deliveryApps.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Ordina Online</h3>
                <div className="grid grid-cols-2 gap-2">
                  {deliveryApps.map((app) => (
                    <Button
                      key={app.name}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(app.url!, '_blank')}
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      {app.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Seguici</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(social.url!, '_blank')}
                        className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}
