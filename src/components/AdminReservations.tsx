'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Reservation {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string
  data: string
  ora: string
  persone: number
  note?: string | null
  stato: string
  createdAt: string
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStato, setFilterStato] = useState('all')

  useEffect(() => {
    fetchData()
  }, [filterStato])

  async function fetchData() {
    setLoading(true)
    try {
      const url = filterStato === 'all'
        ? '/api/admin/reservations'
        : `/api/admin/reservations?stato=${filterStato}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error('Errore nel recupero prenotazioni:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, stato: string) {
    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato })
      })

      if (response.ok) {
        fetchData()
        alert('Stato aggiornato con successo!')
      }
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      alert('Errore nell\'aggiornamento dello stato')
    }
  }

  async function deleteReservation(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return

    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
        alert('Prenotazione eliminata con successo!')
      }
    } catch (error) {
      console.error('Errore eliminazione prenotazione:', error)
      alert('Errore nell\'eliminazione della prenotazione')
    }
  }

  function getStatoBadge(stato: string) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'In Attesa',
      confirmed: 'Confermata',
      cancelled: 'Cancellata'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[stato as keyof typeof badges] || badges.pending}`}>
        {labels[stato as keyof typeof labels] || stato}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prenotazioni</h2>
        <div className="flex items-center gap-2">
          <Label>Stato:</Label>
          <Select value={filterStato} onValueChange={setFilterStato}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="pending">In Attesa</SelectItem>
              <SelectItem value="confirmed">Confermate</SelectItem>
              <SelectItem value="cancelled">Cancellate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Persone</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nessuna prenotazione trovata
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">
                      {new Date(res.data).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>{res.ora}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{res.nome} {res.cognome}</div>
                        {res.note && (
                          <div className="text-sm text-gray-500 mt-1">{res.note}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{res.email}</div>
                        <div>{res.telefono}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        {res.persone}
                      </div>
                    </TableCell>
                    <TableCell>{getStatoBadge(res.stato)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {res.stato === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(res.id, 'confirmed')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(res.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReservation(res.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>ℹ️ Le prenotazioni in attesa possono essere confermate o cancellate.</p>
      </div>
    </div>
  )
}