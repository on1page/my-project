'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ChiSiamo from '@/components/ChiSiamo'
import Specialita from '@/components/Specialita'
import Footer from '@/components/Footer'
import SocialSidebar from '@/components/SocialSidebar'
import AdminPanel from '@/components/AdminPanel'

interface SiteInfo {
  nomeLocale?: string
  slogan?: string
  chiSiamoTitolo?: string
  chiSiamoTesto?: string
  logoUrl?: string
  faviconUrl?: string
}

export default function Home() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({})
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    async function fetchSiteInfo() {
      try {
        const response = await fetch('/api/admin/site-info')
        if (response.ok) {
          const data = await response.json()
          setSiteInfo(data)
        }
      } catch (error) {
        console.error('Errore nel recupero site info:', error)
      }
    }

    fetchSiteInfo()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        siteName={siteInfo.nomeLocale || 'Il Nostro Ristorante'}
        logoUrl={siteInfo.logoUrl}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      <main className="flex-1">
        <Hero
          title={siteInfo.slogan || 'Autentica Cucina Italiana'}
          ctaText="Scopri il Menu"
        />

        <ChiSiamo
          title={siteInfo.chiSiamoTitolo || 'Chi Siamo'}
          content={siteInfo.chiSiamoTesto || 'Dal 1985, portiamo in tavola l\'autentica tradizione culinaria italiana. La nostra passione per la cucina e l\'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo.'}
        />

        <Specialita showBestChoice={true} showPromo={true} limit={6} />
      </main>

      <Footer />
      <SocialSidebar />

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  )
}
