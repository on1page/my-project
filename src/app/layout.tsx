import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import CookieBanner from "@/components/CookieBanner";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import ThemeWrapper from "@/components/ThemeWrapper";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Recupera le impostazioni SEO dal database
  const siteInfo = await db.siteInfo.findFirst();

  // URL di base per metadata
  const baseUrl = siteInfo?.seoCanonical || 'https://localhost:3000';

  // Valori di default ottimizzati per ristorante
  const defaultTitle = siteInfo?.nomeLocale || "Il Nostro Ristorante";
  const defaultDescription = siteInfo?.slogan || "Autentica cucina italiana con ingredienti freschi e di qualità. Prenota il tuo tavolo e scopri i nostri piatti tradizionali.";
  const defaultKeywords = ["ristorante", "cucina italiana", "piatti tradizionali", "prenotazioni", "menu", "specialità", "food"];
  const defaultOgTitle = `${defaultTitle} - Cucina Italiana Autentica`;
  const defaultOgDescription = "Scopri i sapori della tradizione culinaria italiana. Prenota il tuo tavolo online e goditi un'esperienza gastronomica unica.";

  const title = siteInfo?.seoTitle || defaultTitle;
  const description = siteInfo?.seoDescription || defaultDescription;
  const keywords = siteInfo?.seoKeywords ? siteInfo.seoKeywords.split(',').map(k => k.trim()) : defaultKeywords;
  const ogTitle = siteInfo?.seoOgTitle || defaultOgTitle;
  const ogDescription = siteInfo?.seoOgDescription || defaultOgDescription;
  const ogImage = siteInfo?.seoOgImage || siteInfo?.heroImageUrl || siteInfo?.logoUrl;
  const twitterCard = siteInfo?.seoTwitterCard || "summary_large_image";
  const robots = siteInfo?.seoRobots || "index, follow";

  const metadata: Metadata = {
    // Base URL per risolvere percorsi relativi
    metadataBase: new URL(baseUrl),

    // Meta tags base
    title,
    description,
    keywords,
    authors: [{ name: siteInfo?.nomeLocale || "Il Nostro Ristorante" }],
    creator: siteInfo?.nomeLocale || "Il Nostro Ristorante",
    publisher: siteInfo?.nomeLocale || "Il Nostro Ristorante",

    // Robots
    robots: robots,

    // Favicon e icone
    icons: {
      icon: [
        { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
      ],
    },

    // Open Graph per social media
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: siteInfo?.nomeLocale || "Il Nostro Ristorante",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: ogTitle,
        type: "image/jpeg",
      }] : undefined,
    },

    // Twitter Card
    twitter: {
      card: twitterCard as "summary" | "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },

    // Additional meta tags
    applicationName: siteInfo?.nomeLocale || "Il Nostro Ristorante",
    category: "Restaurant, Food & Dining",
    classification: "Restaurant",
  };

  // Aggiungi canonical URL se configurato
  if (siteInfo?.seoCanonical) {
    metadata.alternates = {
      canonical: siteInfo.seoCanonical,
    };
  }

  return metadata;
}

// Genera il markup Schema.org JSON-LD
async function generateStructuredData() {
  const [siteInfo, footerInfo, companyData] = await Promise.all([
    db.siteInfo.findFirst(),
    db.footerInfo.findFirst(),
    db.companyData.findFirst(),
  ]);

  // URL di base
  const baseUrl = siteInfo?.seoCanonical || 'https://localhost:3000';

  // Dati LocalBusiness (Ristorante)
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteInfo?.nomeLocale || 'Il Nostro Ristorante',
    description: siteInfo?.seoDescription || siteInfo?.slogan || 'Ristorante con cucina autentica',
    url: baseUrl,
    telephone: siteInfo?.telefono || companyData?.telefono || undefined,
    email: siteInfo?.email || companyData?.email || undefined,
    logo: siteInfo?.logoUrl || undefined,
    image: siteInfo?.heroImageUrl || siteInfo?.logoUrl || undefined,
    address: (footerInfo?.indirizzo && footerInfo?.citta) ? {
      '@type': 'PostalAddress',
      streetAddress: footerInfo.indirizzo,
      addressLocality: footerInfo.citta,
      postalCode: footerInfo.cap || undefined,
      addressRegion: footerInfo.provincia || undefined,
      addressCountry: companyData?.paese || 'IT',
    } : undefined,
    geo: (footerInfo?.latitudine && footerInfo?.longitudine) ? {
      '@type': 'GeoCoordinates',
      latitude: footerInfo.latitudine,
      longitude: footerInfo.longitudine,
    } : undefined,
    openingHoursSpecification: footerInfo?.orariApertura ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00',
      description: `${footerInfo.orariApertura}${footerInfo?.giorniChiusura ? `. Chiuso: ${footerInfo.giorniChiusura}` : ''}`,
    } : undefined,
    priceRange: '€€',
    servesCuisine: 'Italian',
    sameAs: [
      footerInfo?.facebookUrl,
      footerInfo?.instagramUrl,
      footerInfo?.twitterUrl,
      footerInfo?.linkedinUrl,
      footerInfo?.whatsappUrl,
    ].filter(Boolean),
  };

  // Dati WebSite
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteInfo?.nomeLocale || 'Il Nostro Ristorante',
    url: baseUrl,
    description: siteInfo?.seoDescription || siteInfo?.slogan || 'Sito ufficiale del ristorante',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/menu?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return { localBusiness, webSite, baseUrl };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Genera i dati strutturati Schema.org
  const { localBusiness, webSite, baseUrl } = await generateStructuredData();
  const siteInfo = await db.siteInfo.findFirst();
  const primaryColor = siteInfo?.primaryColor || '#ea580c';

  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Meta tags aggiuntivi per mobile e PWA */}
        <meta name="theme-color" content={primaryColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteInfo?.nomeLocale || "Ristorante"} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content={primaryColor} />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* Schema.org JSON-LD - LocalBusiness (Restaurant) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusiness),
          }}
        />

        {/* Schema.org JSON-LD - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSite),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeWrapper primaryColor={primaryColor}>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ThemeWrapper>
        <ThirdPartyScripts />
        <CookieBanner />
        <Toaster />
      </body>
    </html>
  );
}
