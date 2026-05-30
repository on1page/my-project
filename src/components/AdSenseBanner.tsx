'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export default function AdSenseBanner({ adSlot, adFormat = 'auto', className = '' }: AdSenseBannerProps) {
  const [adSenseId, setAdSenseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [backendToggle, setBackendToggle] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [adElementId] = useState(() => `adsense-${Math.random().toString(36).substring(2, 9)}`);
  const [adInitialized, setAdInitialized] = useState(false);

  // Get ad format class
  const getAdFormatClass = () => {
    switch (adFormat) {
      case 'rectangle':
        return 'w-[300px] h-[250px]';
      case 'horizontal':
        return 'w-[728px] h-[90px]';
      case 'vertical':
        return 'w-[160px] h-[600px]';
      default:
        return 'w-full h-[90px] md:h-[250px]';
    }
  };

  useEffect(() => {
    // Check cookie consent
    const checkConsent = () => {
      const cookieConsent = localStorage.getItem('cookie-preferences');
      const consent = cookieConsent ? JSON.parse(cookieConsent) : null;
      const hasMarketingConsent = consent?.marketing === true;
      setHasConsent(hasMarketingConsent);
    };

    checkConsent();

    // Check backend toggle and get AdSense ID
    const fetchAdSenseData = async () => {
      try {
        const response = await fetch('/api/admin/company-data');
        if (response.ok) {
          const data = await response.json();
          setBackendToggle(data.data?.['Abilita Script di terze Parti'] || false);
          setAdSenseId(data.data?.['adSenseId'] || null);
        }
      } catch (error) {
        console.error('Error fetching AdSense data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdSenseData();
  }, []);

  useEffect(() => {
    // Load AdSense script if conditions are met and script not already loaded
    if (hasConsent && backendToggle && adSenseId && !scriptLoaded) {
      // Check if script already exists
      if ((window as any).adsbygoogle) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adSenseId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        setScriptLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, [hasConsent, backendToggle, adSenseId, scriptLoaded]);

  useEffect(() => {
    // Push ad to Google when script is loaded and DOM is ready
    if (scriptLoaded && !adInitialized && adSenseId) {
      const adElement = document.getElementById(adElementId);
      if (adElement && (window as any).adsbygoogle) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setAdInitialized(true);
        } catch (error) {
          console.error('AdSense push error:', error);
        }
      }
    }
  }, [scriptLoaded, adInitialized, adElementId, adSenseId]);

  // Don't render anything if conditions not met
  if (isLoading || (!hasConsent && !backendToggle)) {
    return null;
  }

  // Don't render if no AdSense ID configured
  if (!adSenseId) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {scriptLoaded ? (
        <ins
          id={adElementId}
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={`ca-pub-${adSenseId}`}
          data-ad-slot={adSlot}
          data-ad-format={adFormat === 'auto' ? 'auto' : 'rectangle'}
          data-full-width-responsive="true"
        />
      ) : (
        <div className={`flex items-center justify-center ${getAdFormatClass()}`}>
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}