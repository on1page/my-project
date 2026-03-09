'use client'

import { useState, useEffect } from 'react'
import { Save, FileText, Cookie, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CompanyData {
  id: string
  ragioneSociale?: string | null
  partitaIva?: string | null
  privacyPolicy?: string | null
  cookiesPolicy?: string | null
  terminiServizio?: string | null
}

export default function AdminCompanyData() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    id: '',
    ragioneSociale: '',
    partitaIva: '',
    privacyPolicy: '',
    cookiesPolicy: '',
    terminiServizio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/company-data')
      if (response.ok) {
        const data = await response.json()
        setCompanyData(data)
      }
    } catch (error) {
      console.error('Errore nel recupero dati aziendali:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      })

      if (response.ok) {
        alert('Dati aziendali salvati con successo!')
      } else {
        alert('Errore nel salvataggio')
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dati Aziendali</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva Dati'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dati Societari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ragione Sociale</Label>
              <Input
                value={companyData.ragioneSociale || ''}
                onChange={(e) => setCompanyData({ ...companyData, ragioneSociale: e.target.value })}
                placeholder="S.r.l. S.n.c., ecc."
              />
            </div>
            <div>
              <Label>Partita IVA</Label>
              <Input
                value={companyData.partitaIva || ''}
                onChange={(e) => setCompanyData({ ...companyData, partitaIva: e.target.value })}
                placeholder="IT12345678901"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookies Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Testo Cookies Policy</Label>
              <Textarea
                value={companyData.cookiesPolicy || ''}
                onChange={(e) => setCompanyData({ ...companyData, cookiesPolicy: e.target.value })}
                rows={8}
                placeholder="Inserisci il testo della cookies policy..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Testo Privacy Policy</Label>
              <Textarea
                value={companyData.privacyPolicy || ''}
                onChange={(e) => setCompanyData({ ...companyData, privacyPolicy: e.target.value })}
                rows={10}
                placeholder="Inserisci il testo della privacy policy..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Termini di Servizio</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Testo Termini di Servizio</Label>
              <Textarea
                value={companyData.terminiServizio || ''}
                onChange={(e) => setCompanyData({ ...companyData, terminiServizio: e.target.value })}
                rows={8}
                placeholder="Inserisci i termini di servizio..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}