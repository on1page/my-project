import type { Metadata } from "next";
import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await db.siteInfo.findFirst();
  const baseUrl = siteInfo?.seoCanonical || 'https://localhost:3000';

  return {
    title: "Cookie Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
    description: "Informativa sull'utilizzo dei cookie nel nostro sito web. Scopri come utilizziamo i cookie tecnici, analitici e di marketing.",
    keywords: ["cookie policy", "privacy", "cookie", "gdpr", "informatica", "tracciamento"],
    openGraph: {
      title: "Cookie Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
      description: "La nostra politica sull'utilizzo dei cookie",
      url: `${baseUrl}/cookie-policy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Cookie Policy",
    },
    alternates: {
      canonical: `${baseUrl}/cookie-policy`,
    },
    robots: "index, follow",
  };
}

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
