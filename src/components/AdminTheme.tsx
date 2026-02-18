'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Image as ImageIcon, FileText, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SiteInfo {
  id: string
  nomeLocale?: string | null
  slogan?: string | null
  chiSiamoTitolo?: string | null
  chiSiamoTesto?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  telefono?: string | null
  email?: string | null
}

interface SiteImage {
  id: string
  sezione: string
  titolo?: string | null
  descrizione?: string | null
  url: string
  ordine: number
  attiva: boolean
}

export default function AdminTheme() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    id: '',
    nomeLocale: '',
    slogan: '',
    chiSiamoTitolo: '',
    chiSiamoTesto: '',
    logoUrl: '',
    faviconUrl: '',
    telefono: '',
    email: ''
  })
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)

  // Image form
  const [imageForm, setImageForm] = useState({
    id: '',
    sezione: 'hero',
    titolo: '',
    descrizione: '',
    url: '',
    ordine: 0,
    attiva: true
  })
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState('hero')

  useEffect(() => {
    fetchData()
  }, [selectedSection])

  async function fetchData() {
    setLoading(true)
    try {
      const [siteRes, imgRes] = await Promise.all([
        fetch('/api/admin/site-info'),
        fetch(`/api/admin/images?sezione=${selectedSection}`)
      ])

      if (siteRes.ok) setSiteInfo(await siteRes.json())
      if (imgRes.ok) setImages(await imgRes.json())
    } catch (error) {
      console.error('Errore nel recupero dati:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSiteInfo() {
    try {
      const response = await fetch('/api/admin/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo)
      })

      if (response.ok) {
        alert('Informazioni del sito salvate con successo!')
      } else {
        alert('Errore nel salvataggio')
      }
    } catch (error) {
      console.error('Errore salvataggio site info:', error)
      alert('Errore nel salvataggio')
    }
  }

  async function saveImage() {
    const url = imageForm.id
      ? `/api/admin/images/${imageForm.id}`
      : '/api/admin/images'
    const method = imageForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageForm)
      })

      if (response.ok) {
        setShowImageDialog(false)
        resetImageForm()
        fetchData()
      }
    } catch (error) {
      console.error('Errore salvataggio immagine:', error)
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return

    try {
      const response = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Errore eliminazione immagine:', error)
    }
  }

  function editImage(img: SiteImage) {
    setImageForm({
      id: img.id,
      sezione: img.sezione,
      titolo: img.titolo || '',
      descrizione: img.descrizione || '',
      url: img.url,
      ordine: img.ordine,
      attiva: img.attiva
    })
    setShowImageDialog(true)
  }

  function resetImageForm() {
    setImageForm({
      id: '',
      sezione: selectedSection,
      titolo: '',
      descrizione: '',
      url: '',
      ordine: 0,
      attiva: true
    })
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informazioni Generali</TabsTrigger>
          <TabsTrigger value="images">Immagini</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="w-6 h-6" />
              Informazioni del Sito
            </h2>
            <Button onClick={saveSiteInfo}>
              <Save className="w-4 h-4 mr-2" />
              Salva Informazioni
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nome e Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome del Locale *</Label>
                  <Input
                    value={siteInfo.nomeLocale || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })}
                    placeholder="Il Nostro Ristorante"
                  />
                </div>
                <div>
                  <Label>Slogan / Sottotitolo Hero</Label>
                  <Input
                    value={siteInfo.slogan || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, slogan: e.target.value })}
                    placeholder="Autentica Cucina Italiana"
                  />
                </div>
                <div>
                  <Label>URL Logo</Label>
                  <Input
                    value={siteInfo.logoUrl || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>URL Favicon</Label>
                  <Input
                    value={siteInfo.faviconUrl || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, faviconUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contenuti Testuali
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Titolo Sezione "Chi Siamo"</Label>
                  <Input
                    value={siteInfo.chiSiamoTitolo || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, chiSiamoTitolo: e.target.value })}
                    placeholder="Chi Siamo"
                  />
                </div>
                <div>
                  <Label>Testo Sezione "Chi Siamo"</Label>
                  <Textarea
                    value={siteInfo.chiSiamoTesto || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, chiSiamoTesto: e.target.value })}
                    rows={5}
                    placeholder="Descrivi la tua storia..."
                  />
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input
                    value={siteInfo.telefono || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, telefono: e.target.value })}
                    placeholder="+39 012 345 6789"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={siteInfo.email || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                    placeholder="info@tuoristorante.it"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Gestione Immagini
            </h2>
            <div className="flex items-center gap-4">
              <select
                className="p-2 border rounded"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="hero">Hero</option>
                <option value="chi_siamo">Chi Siamo</option>
                <option value="gallery">Galleria</option>
                <option value="menu">Menu</option>
              </select>
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetImageForm(); setImageForm({ ...imageForm, sezione: selectedSection }) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Immagine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {imageForm.id ? 'Modifica Immagine' : 'Nuova Immagine'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Sezione</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={imageForm.sezione}
                        onChange={(e) => setImageForm({ ...imageForm, sezione: e.target.value })}
                      >
                        <option value="hero">Hero</option>
                        <option value="chi_siamo">Chi Siamo</option>
                        <option value="gallery">Galleria</option>
                        <option value="menu">Menu</option>
                      </select>
                    </div>
                    <div>
                      <Label>Titolo</Label>
                      <Input
                        value={imageForm.titolo}
                        onChange={(e) => setImageForm({ ...imageForm, titolo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descrizione</Label>
                      <Textarea
                        value={imageForm.descrizione}
                        onChange={(e) => setImageForm({ ...imageForm, descrizione: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>URL Immagine *</Label>
                      <Input
                        value={imageForm.url}
                        onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Ordine</Label>
                      <Input
                        type="number"
                        value={imageForm.ordine}
                        onChange={(e) => setImageForm({ ...imageForm, ordine: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveImage}>
                        <Save className="w-4 h-4 mr-2" />
                        Salva
                      </Button>
                      <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anteprima</TableHead>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Sezione</TableHead>
                  <TableHead>Ordine</TableHead>
                  <TableHead>Attiva</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((img) => (
                  <TableRow key={img.id}>
                    <TableCell>
                      <img
                        src={img.url}
                        alt={img.titolo || img.sezione}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{img.titolo || '-'}</TableCell>
                    <TableCell>{img.sezione}</TableCell>
                    <TableCell>{img.ordine}</TableCell>
                    <TableCell>{img.attiva ? 'Sì' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editImage(img)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteImage(img.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
