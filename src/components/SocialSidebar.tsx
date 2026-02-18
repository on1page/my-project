'use client'

import { useState, useEffect } from 'react'
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle, X } from 'lucide-react'

interface SocialSidebarProps {
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
}

export default function SocialSidebar() {
  const [footerInfo, setFooterInfo] = useState<SocialSidebarProps>({})
  const [isOpen, setIsOpen] = useState(false)

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
    { name: 'Facebook', url: footerInfo.facebookUrl, icon: Facebook, color: 'bg-blue-600' },
    { name: 'Instagram', url: footerInfo.instagramUrl, icon: Instagram, color: 'bg-pink-600' },
    { name: 'Twitter', url: footerInfo.twitterUrl, icon: Twitter, color: 'bg-sky-500' },
    { name: 'LinkedIn', url: footerInfo.linkedinUrl, icon: Linkedin, color: 'bg-blue-700' },
    { name: 'WhatsApp', url: footerInfo.whatsappUrl, icon: MessageCircle, color: 'bg-green-600' }
  ].filter(social => social.url)

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-4 bottom-24 z-50 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label="Toggle social menu"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Social Links Container */}
      <div
        className={`fixed left-4 bottom-28 z-50 flex flex-col gap-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-100px] pointer-events-none'
        }`}
      >
        {socialLinks.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.name}
              href={social.url!}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200`}
              aria-label={social.name}
              title={social.name}
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        })}
      </div>
    </>
  )
}
