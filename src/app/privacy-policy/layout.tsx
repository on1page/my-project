import type { Metadata } from "next";
import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await db.siteInfo.findFirst();
  const baseUrl = siteInfo?.seoCanonical || 'https://localhost:3000';

  return {
    title: "Privacy Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
    description: "Informativa sulla privacy e trattamento dei dati personali. Scopri come proteggiamo i tuoi dati in conformità con il GDPR.",
    keywords: ["privacy policy", "privacy", "gdpr", "dati personali", "trattamento dati", "protezione dati"],
    openGraph: {
      title: "Privacy Policy | " + (siteInfo?.nomeLocale || "Ristorante"),
      description: "La nostra politica sulla privacy e protezione dati",
      url: `${baseUrl}/privacy-policy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Privacy Policy",
    },
    alternates: {
      canonical: `${baseUrl}/privacy-policy`,
    },
    robots: "index, follow",
  };
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
