'use client'

import { useState, useEffect } from 'react'
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle, X, Share2 } from 'lucide-react'

interface SocialSidebarProps {
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
}

export default function SocialSidebar() {
  const [footerInfo, setFooterInfo] = useState<SocialSidebarProps>({})
  const [isOpen, setIsOpen] = useState(true)

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

  const socialLinks = [
    { name: 'Facebook', url: footerInfo.facebookUrl, icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Instagram', url: footerInfo.instagramUrl, icon: Instagram, color: 'bg-pink-600 hover:bg-pink-700' },
    { name: 'Twitter', url: footerInfo.twitterUrl, icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { name: 'LinkedIn', url: footerInfo.linkedinUrl, icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800' },
    { name: 'WhatsApp', url: footerInfo.whatsappUrl, icon: MessageCircle, color: 'bg-green-600 hover:bg-green-700' }
  ].filter(social => social.url)

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <>
      {/* Container Principale - Tendina attaccata a sinistra */}
      <div
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl transition-all duration-300 ${
          isOpen ? 'opacity-60 translate-x-0' : 'opacity-0 -translate-x-[100%] pointer-events-none'
        }`}
        style={{ 
          maxHeight: '70vh',
          borderTopRightRadius: '1rem',
          borderBottomRightRadius: '1rem',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0'
        }}
      >
        {/* Header della Tendina con solo X di chiusura */}
        <div className="flex justify-end items-center p-2 border-r border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors group"
            aria-label="Chiudi"
          >
            <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Lista Social - Solo icone senza nomi */}
        <div className="p-2 space-y-2 border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url!}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex justify-center items-center w-12 h-12 rounded-full ${social.color} text-white hover:scale-105 hover:shadow-md transition-all duration-200`}
                aria-label={social.name}
                title={social.name}
              >
                <Icon className="w-6 h-6" />
              </a>
            )
          })}
        </div>
      </div>

      {/* Pulsante per riaprire la tendina */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-r-lg shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Apri menu social"
          title="Apri social"
          style={{ borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
