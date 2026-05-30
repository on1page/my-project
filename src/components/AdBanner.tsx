'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';

interface Banner {
  id: string;
  tipo: string;
  posizione: string;
  sponsorNome: string;
  sponsorLogo?: string | null;
  sponsorUrl: string;
  titolo?: string | null;
  descrizione?: string | null;
  ctaTesto?: string | null;
  ctaUrl?: string | null;
  immagineUrl?: string | null;
  coloreSfondo?: string | null;
  attivo: boolean;
  ordine: number;
  pagine?: string | null;
}

interface AdBannerProps {
  pagina?: string;
  posizione?: 'top' | 'bottom' | 'left' | 'right' | 'inline';
  tipo?: 'horizontal' | 'vertical';
}

export default function AdBanner({ pagina = 'eventi', posizione = 'top', tipo }: AdBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [canShow, setCanShow] = useState(false);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Recupera i banner rimossi dall'utente
    const dismissed = localStorage.getItem('dismissed-banners');
    if (dismissed) {
      setDismissedBanners(new Set(JSON.parse(dismissed)));
    }

    // Verifica se può mostrare i banner
    checkCanShow();
  }, []);

  useEffect(() => {
    if (canShow) {
      fetchBanners();
    } else {
      setLoading(false);
    }
  }, [canShow, pagina, posizione, tipo]);

  const checkCanShow = async () => {
    try {
      // 1. Verifica consenso dell'utente per cookie marketing
      const cookieConsent = localStorage.getItem('cookie-consent');
      const cookiePreferences = localStorage.getItem('cookie-preferences');
      const hasMarketingConsent = checkMarketingConsent(cookieConsent, cookiePreferences);

      // 2. Verifica se gli script sono abilitati dal backend
      const response = await fetch('/api/admin/company-data');
      const companyData = await response.json();
      const scriptsEnabled = companyData.thirdPartyScriptsEnabled ?? false;

      // Mostra se ha consenso marketing OPPURE se abilitato dal backend
      setCanShow(hasMarketingConsent || scriptsEnabled);
    } catch (error) {
      console.error('Errore nel controllo permessi banner:', error);
      // In caso di errore, non mostrare i banner per sicurezza
      setCanShow(false);
    }
  };

  const checkMarketingConsent = (consent: string | null, preferences: string | null): boolean => {
    if (!consent) return false;

    // Se ha accettato tutti, ha consenso marketing
    if (consent === 'accepted') return true;

    // Se ha scelto preferenze personalizzate, controlla
    if (consent === 'custom' && preferences) {
      try {
        const prefs = JSON.parse(preferences);
        return prefs.marketing === true;
      } catch {
        return false;
      }
    }

    // Altri casi (necessary-only, declined) = no consenso marketing
    return false;
  };

  const fetchBanners = async () => {
    try {
      const params = new URLSearchParams({ pagina });
      if (tipo) params.append('tipo', tipo);
      if (posizione) params.append('posizione', posizione);

      const response = await fetch(`/api/banners?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setBanners(result.data || []);
      }
    } catch (error) {
      console.error('Errore nel recupero banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (bannerId: string) => {
    const newDismissed = new Set(dismissedBanners);
    newDismissed.add(bannerId);
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissed-banners', JSON.stringify([...newDismissed]));

    // Rimuovi il banner dallo stato
    setBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  if (loading || !canShow || banners.length === 0) {
    return null;
  }

  // Filtra i banner non rimossi
  const visibleBanners = banners.filter(b => !dismissedBanners.has(b.id));

  if (visibleBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {visibleBanners.map((banner) => (
        <AdBannerItem
          key={banner.id}
          banner={banner}
          onDismiss={() => handleDismiss(banner.id)}
        />
      ))}
    </div>
  );
}

interface AdBannerItemProps {
  banner: Banner;
  onDismiss: () => void;
}

function AdBannerItem({ banner, onDismiss }: AdBannerItemProps) {
  const isHorizontal = banner.tipo === 'horizontal';

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        isHorizontal ? 'my-6' : 'my-4'
      }`}
      style={{ backgroundColor: banner.coloreSfondo || '#f9fafb' }}
    >
      {/* Pulsante chiudi */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
        aria-label="Chiudi banner"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      {/* Contenuto banner */}
      <div
        className={`${isHorizontal ? 'flex md:flex-row' : 'flex flex-col'} items-stretch`}
      >
        {/* Immagine o Logo */}
        {banner.immagineUrl || banner.sponsorLogo ? (
          <div
            className={`relative ${
              isHorizontal ? 'w-1/3 md:w-1/4 min-h-[150px] md:min-h-[200px]' : 'w-full h-40'
            }`}
          >
            <a
              href={banner.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={banner.immagineUrl || banner.sponsorLogo!}
                alt={banner.titolo || banner.sponsorNome}
                className="w-full h-full object-cover"
              />
            </a>
          </div>
        ) : null}

        {/* Contenuto testuale */}
        <div
          className={`flex-1 p-4 md:p-6 flex flex-col justify-between ${
            banner.immagineUrl || banner.sponsorLogo ? '' : 'p-4 md:p-6'
          }`}
        >
          <div>
            {/* Sponsor */}
            {banner.sponsorLogo && !banner.immagineUrl ? (
              <a
                href={banner.sponsorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-2"
              >
                <span className="text-xs text-gray-400">Sponsorizzato da</span>
                <img
                  src={banner.sponsorLogo}
                  alt={banner.sponsorNome}
                  className="h-6 w-auto"
                />
              </a>
            ) : (
              <span className="text-xs text-gray-400 block mb-2">
                Sponsorizzato da {banner.sponsorNome}
              </span>
            )}

            {/* Titolo */}
            {banner.titolo && (
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {banner.titolo}
              </h3>
            )}

            {/* Descrizione */}
            {banner.descrizione && (
              <p className="text-sm md:text-base text-gray-700 mb-4 line-clamp-2">
                {banner.descrizione}
              </p>
            )}
          </div>

          {/* CTA */}
          {(banner.ctaTesto && banner.ctaUrl) ? (
            <a
              href={banner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              {banner.ctaTesto}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={banner.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm md:text-base"
            >
              Visita {banner.sponsorNome}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}