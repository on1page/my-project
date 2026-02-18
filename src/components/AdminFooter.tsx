'use client'

import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

interface FooterInfo {
  id: string
  indirizzo?: string | null
  citta?: string | null
  cap?: string | null
  provincia?: string | null
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

export default function AdminFooter() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({
    id: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    latitudine: null,
    longitudine: null,
    orariApertura: '',
    giorniChiusura: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    whatsappUrl: '',
    justeatUrl: '',
    deliverooUrl: '',
    glovoUrl: '',
    ubereatsUrl: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterInfo()
  }, [])

  async function fetchFooterInfo() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/footer')
      if (response.ok) {
        const data = await response.json()
        setFooterInfo(data)
      }
    } catch (error) {
      console.error('Errore nel recupero footer info:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveFooterInfo() {
    try {
      const response = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerInfo)
      })

      if (response.ok) {
        alert('Informazioni salvate con successo!')
      } else {
        alert('Errore nel salvataggio delle informazioni')
      }
    } catch (error) {
      console.error('Errore salvataggio footer info:', error)
      alert('Errore nel salvataggio delle informazioni')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Footer</h2>
        <Button onClick={saveFooterInfo}>
          <Save className="w-4 h-4 mr-2" />
          Salva Tutte le Informazioni
        </Button>
      </div>

      <Tabs defaultValue="indirizzo">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indirizzo">Indirizzo</TabsTrigger>
          <TabsTrigger value="orari">Orari</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="indirizzo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Indirizzo e Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Indirizzo</Label>
                  <Input
                    value={footerInfo.indirizzo || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, indirizzo: e.target.value })}
                    placeholder="Via Roma 123"
                  />
                </div>
                <div>
                  <Label>Città</Label>
                  <Input
                    value={footerInfo.citta || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, citta: e.target.value })}
                    placeholder="Milano"
                  />
                </div>
                <div>
                  <Label>CAP</Label>
                  <Input
                    value={footerInfo.cap || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, cap: e.target.value })}
                    placeholder="20100"
                  />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    value={footerInfo.provincia || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, provincia: e.target.value })}
                    placeholder="MI"
                  />
                </div>
                <div>
                  <Label>Latitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    value={footerInfo.latitudine || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, latitudine: parseFloat(e.target.value) || null })}
                    placeholder="45.4642"
                  />
                </div>
                <div>
                  <Label>Longitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    value={footerInfo.longitudine || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, longitudine: parseFloat(e.target.value) || null })}
                    placeholder="9.1900"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Per ottenere latitudine e longitudine, cerca il tuo indirizzo su Google Maps e clicca con il tasto destro sulla posizione.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orari">
          <Card>
            <CardHeader>
              <CardTitle>Orari di Apertura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Orari di Apertura (JSON)</Label>
                <Textarea
                  value={footerInfo.orariApertura || ''}
                  onChange={(e) => setFooterInfo({ ...footerInfo, orariApertura: e.target.value })}
                  rows={10}
                  placeholder='[
  {"giorno": "Lun - Ven", "orario": "12:00 - 14:30, 19:00 - 23:00"},
  {"giorno": "Sabato", "orario": "12:00 - 15:00, 19:00 - 00:00"},
  {"giorno": "Domenica", "orario": "12:00 - 15:00"}
]'
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Formato JSON con giorno e orario. Lascia vuoto per non mostrare la sezione orari.
                </p>
              </div>
              <div>
                <Label>Giorni di Chiusura (JSON)</Label>
                <Textarea
                  value={footerInfo.giorniChiusura || ''}
                  onChange={(e) => setFooterInfo({ ...footerInfo, giorniChiusura: e.target.value })}
                  rows={3}
                  placeholder='["Lunedì a pranzo", "Martedì"]'
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Array di giorni di chiusura. Lascia vuoto se aperto tutti i giorni.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook URL
                  </Label>
                  <Input
                    value={footerInfo.facebookUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram URL
                  </Label>
                  <Input
                    value={footerInfo.instagramUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    Twitter URL
                  </Label>
                  <Input
                    value={footerInfo.twitterUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    LinkedIn URL
                  </Label>
                  <Input
                    value={footerInfo.linkedinUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp URL
                  </Label>
                  <Input
                    value={footerInfo.whatsappUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/391234567890"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Inserisci solo i link dei social che vuoi mostrare. I campi vuoti non verranno visualizzati.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>App di Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Just Eat URL</Label>
                  <Input
                    value={footerInfo.justeatUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, justeatUrl: e.target.value })}
                    placeholder="https://www.justeat.it/ristoranti/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Deliveroo URL</Label>
                  <Input
                    value={footerInfo.deliverooUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, deliverooUrl: e.target.value })}
                    placeholder="https://deliveroo.it/it/it/menu/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Glovo URL</Label>
                  <Input
                    value={footerInfo.glovoUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, glovoUrl: e.target.value })}
                    placeholder="https://glovoapp.com/it/it/store/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Uber Eats URL</Label>
                  <Input
                    value={footerInfo.ubereatsUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, ubereatsUrl: e.target.value })}
                    placeholder="https://www.ubereats.com/it/store/tuoristorante"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Inserisci solo i link delle app che utilizzi. I campi vuoti non verranno visualizzati.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
