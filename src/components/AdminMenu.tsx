'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Allergene {
  id: string
  nome: string
  icona?: string | null
}

interface Categoria {
  id: string
  nome: string
  ordine: number
  attiva: boolean
  _count?: { articoli: number }
}

interface Articolo {
  id: string
  nome: string
  descrizione: string | null
  categoriaId: string
  categoria: Categoria
  prezzo: number
  prezzoPromozionale: number | null
  scadenzaPromo: string | null
  eSurgelato: boolean
  eBestChoice: boolean
  attivo: boolean
  allergeni: Allergene[]
  immagineUrl: string | null
}

export default function AdminMenu() {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [allergeni, setAllergeni] = useState<Allergene[]>([])
  const [loading, setLoading] = useState(true)

  // Categoria form
  const [categoriaForm, setCategoriaForm] = useState({ id: '', nome: '', ordine: 0, attiva: true })
  const [showCategoriaDialog, setShowCategoriaDialog] = useState(false)

  // Articolo form
  const [articoloForm, setArticoloForm] = useState({
    id: '',
    nome: '',
    descrizione: '',
    categoriaId: '',
    prezzo: '',
    prezzoPromozionale: '',
    scadenzaPromo: '',
    eSurgelato: false,
    eBestChoice: false,
    attivo: true,
    allergeni: [] as string[],
    immagineUrl: ''
  })
  const [showArticoloDialog, setShowArticoloDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [catRes, artRes, allRes] = await Promise.all([
        fetch('/api/admin/categorie'),
        fetch('/api/admin/articoli'),
        fetch('/api/admin/allergeni')
      ])

      if (catRes.ok) setCategorie(await catRes.json())
      if (artRes.ok) setArticoli(await artRes.json())
      if (allRes.ok) setAllergeni(await allRes.json())
    } catch (error) {
      console.error('Errore nel recupero dati:', error)
    } finally {
      setLoading(false)
    }
  }

  // Categorie CRUD
  async function saveCategoria() {
    const url = categoriaForm.id
      ? `/api/admin/categorie/${categoriaForm.id}`
      : '/api/admin/categorie'
    const method = categoriaForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaForm)
      })

      if (response.ok) {
        setShowCategoriaDialog(false)
        setCategoriaForm({ id: '', nome: '', ordine: 0, attiva: true })
        fetchData()
      }
    } catch (error) {
      console.error('Errore salvataggio categoria:', error)
    }
  }

  async function deleteCategoria(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa categoria?')) return

    try {
      const response = await fetch(`/api/admin/categorie/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Errore eliminazione categoria:', error)
    }
  }

  function editCategoria(cat: Categoria) {
    setCategoriaForm({
      id: cat.id,
      nome: cat.nome,
      ordine: cat.ordine,
      attiva: cat.attiva
    })
    setShowCategoriaDialog(true)
  }

  // Articoli CRUD
  async function saveArticolo() {
    const url = articoloForm.id
      ? `/api/admin/articoli/${articoloForm.id}`
      : '/api/admin/articoli'
    const method = articoloForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articoloForm)
      })

      if (response.ok) {
        setShowArticoloDialog(false)
        resetArticoloForm()
        fetchData()
      }
    } catch (error) {
      console.error('Errore salvataggio articolo:', error)
    }
  }

  async function deleteArticolo(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return

    try {
      const response = await fetch(`/api/admin/articoli/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Errore eliminazione articolo:', error)
    }
  }

  function editArticolo(art: Articolo) {
    setArticoloForm({
      id: art.id,
      nome: art.nome,
      descrizione: art.descrizione || '',
      categoriaId: art.categoriaId,
      prezzo: art.prezzo.toString(),
      prezzoPromozionale: art.prezzoPromozionale?.toString() || '',
      scadenzaPromo: art.scadenzaPromo?.split('T')[0] || '',
      eSurgelato: art.eSurgelato,
      eBestChoice: art.eBestChoice,
      attivo: art.attivo,
      allergeni: art.allergeni.map(a => a.id),
      immagineUrl: art.immagineUrl || ''
    })
    setShowArticoloDialog(true)
  }

  function resetArticoloForm() {
    setArticoloForm({
      id: '',
      nome: '',
      descrizione: '',
      categoriaId: '',
      prezzo: '',
      prezzoPromozionale: '',
      scadenzaPromo: '',
      eSurgelato: false,
      eBestChoice: false,
      attivo: true,
      allergeni: [],
      immagineUrl: ''
    })
  }

  function toggleAllergene(allergeneId: string) {
    setArticoloForm(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(allergeneId)
        ? prev.allergeni.filter(id => id !== allergeneId)
        : [...prev.allergeni, allergeneId]
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="categorie">
        <TabsList>
          <TabsTrigger value="categorie">Categorie</TabsTrigger>
          <TabsTrigger value="articoli">Articoli</TabsTrigger>
          <TabsTrigger value="allergeni">Allergeni</TabsTrigger>
        </TabsList>

        {/* Categorie */}
        <TabsContent value="categorie" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestione Categorie</h2>
            <Dialog open={showCategoriaDialog} onOpenChange={setShowCategoriaDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCategoriaForm({ id: '', nome: '', ordine: 0, attiva: true }) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {categoriaForm.id ? 'Modifica Categoria' : 'Nuova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={categoriaForm.nome}
                      onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ordine</Label>
                    <Input
                      type="number"
                      value={categoriaForm.ordine}
                      onChange={(e) => setCategoriaForm({ ...categoriaForm, ordine: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="attiva"
                      checked={categoriaForm.attiva}
                      onCheckedChange={(checked) => setCategoriaForm({ ...categoriaForm, attiva: checked as boolean })}
                    />
                    <Label htmlFor="attiva">Attiva</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveCategoria}>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                    <Button variant="outline" onClick={() => setShowCategoriaDialog(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ordine</TableHead>
                  <TableHead>Articoli</TableHead>
                  <TableHead>Attiva</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorie.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.nome}</TableCell>
                    <TableCell>{cat.ordine}</TableCell>
                    <TableCell>{cat._count?.articoli || 0}</TableCell>
                    <TableCell>{cat.attiva ? <Check className="text-green-600" /> : <X className="text-red-600" />}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editCategoria(cat)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategoria(cat.id)}>
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

        {/* Articoli */}
        <TabsContent value="articoli" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestione Articoli</h2>
            <Dialog open={showArticoloDialog} onOpenChange={setShowArticoloDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetArticoloForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Articolo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {articoloForm.id ? 'Modifica Articolo' : 'Nuovo Articolo'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={articoloForm.nome}
                      onChange={(e) => setArticoloForm({ ...articoloForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={articoloForm.descrizione}
                      onChange={(e) => setArticoloForm({ ...articoloForm, descrizione: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={articoloForm.categoriaId}
                      onChange={(e) => setArticoloForm({ ...articoloForm, categoriaId: e.target.value })}
                    >
                      <option value="">Seleziona categoria</option>
                      {categorie.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prezzo (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={articoloForm.prezzo}
                        onChange={(e) => setArticoloForm({ ...articoloForm, prezzo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Prezzo Promo (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={articoloForm.prezzoPromozionale}
                        onChange={(e) => setArticoloForm({ ...articoloForm, prezzoPromozionale: e.target.value })}
                      />
                    </div>
                  </div>
                  {articoloForm.prezzoPromozionale && (
                    <div>
                      <Label>Scadenza Promo</Label>
                      <Input
                        type="date"
                        value={articoloForm.scadenzaPromo}
                        onChange={(e) => setArticoloForm({ ...articoloForm, scadenzaPromo: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <Label>URL Immagine</Label>
                    <Input
                      value={articoloForm.immagineUrl}
                      onChange={(e) => setArticoloForm({ ...articoloForm, immagineUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Flag Speciali</Label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={articoloForm.eBestChoice}
                          onCheckedChange={(checked) => setArticoloForm({ ...articoloForm, eBestChoice: checked as boolean })}
                        />
                        <span>Best Choice</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={articoloForm.eSurgelato}
                          onCheckedChange={(checked) => setArticoloForm({ ...articoloForm, eSurgelato: checked as boolean })}
                        />
                        <span>Prodotto Surgelato</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Allergeni</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {allergeni.map((all) => (
                        <label key={all.id} className="flex items-center gap-2 p-2 border rounded">
                          <Checkbox
                            checked={articoloForm.allergeni.includes(all.id)}
                            onCheckedChange={() => toggleAllergene(all.id)}
                          />
                          <span className="text-sm">{all.icona} {all.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveArticolo}>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                    <Button variant="outline" onClick={() => setShowArticoloDialog(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prezzo</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead>Best Choice</TableHead>
                  <TableHead>Attivo</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articoli.map((art) => (
                  <TableRow key={art.id}>
                    <TableCell>{art.nome}</TableCell>
                    <TableCell>{art.categoria.nome}</TableCell>
                    <TableCell>€{art.prezzo.toFixed(2)}</TableCell>
                    <TableCell>
                      {art.prezzoPromozionale ? `€${art.prezzoPromozionale.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {art.eBestChoice ? <Check className="text-green-600" /> : <X className="text-gray-400" />}
                    </TableCell>
                    <TableCell>
                      {art.attivo ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editArticolo(art)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteArticolo(art.id)}>
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

        {/* Allergeni */}
        <TabsContent value="allergeni" className="space-y-4">
          <h2 className="text-2xl font-bold">Lista Allergeni (Normativa UE)</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icona</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrizione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergeni.map((all) => (
                  <TableRow key={all.id}>
                    <TableCell>{all.icona}</TableCell>
                    <TableCell>{all.nome}</TableCell>
                    <TableCell>{all.descrizione || '-'}</TableCell>
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
