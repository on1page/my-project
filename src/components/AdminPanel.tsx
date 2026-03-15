'use client'

import { useState, useEffect } from 'react'
import { X, LayoutDashboard, Utensils, MapPin, ImageIcon, Users, Building2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminMenu from './AdminMenu'
import AdminFooter from './AdminFooter'
import AdminTheme from './AdminTheme'
import AdminUsers from './AdminUsers'
import AdminCompanyData from './AdminCompanyData'
import AdminReservations from './AdminReservations'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/admin/reservations?stato=pending')
        if (response.ok) {
          const data = await response.json()
          setPendingCount(data.length)
        }
      } catch (error) {
        console.error('Errore nel recupero conteggio prenotazioni:', error)
      }
    }

    fetchPendingCount()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pannello Amministratore</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Footer
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Temi
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Dati Azienda
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2 relative">
                <Calendar className="w-4 h-4" />
                Prenotazioni
                {pendingCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold px-1.5 py-0 rounded-full z-10 overflow-visible border-2 border-white"
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Profili
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu">
              <AdminMenu />
            </TabsContent>

            <TabsContent value="footer">
              <AdminFooter />
            </TabsContent>

            <TabsContent value="theme">
              <AdminTheme />
            </TabsContent>

            <TabsContent value="company">
              <AdminCompanyData />
            </TabsContent>

            <TabsContent value="reservations">
              <AdminReservations />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}