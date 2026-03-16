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

interface Permission {
  puoGestireMenu: boolean
  puoGestireFooter: boolean
  puoGestireTemi: boolean
  puoGestirePrenotazioni: boolean
  puoGestireDatiAzienda: boolean
  puoGestireProfili: boolean
}

interface CurrentUser {
  id: string
  email: string
  nome: string
  cognome?: string | null
  ruolo: string
  permessi?: Permission | null
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [pendingCount, setPendingCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem('adminToken')
        console.log('AdminPanel - Token from localStorage:', token ? 'Present' : 'Missing')

        if (!token) {
          console.log('AdminPanel - No token, skipping fetchUserData')
          return
        }

        console.log('AdminPanel - Fetching /api/admin/me...')
        const response = await fetch('/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('AdminPanel - /api/admin/me response status:', response.status)

        if (response.ok) {
          const userData = await response.json()
          console.log('AdminPanel - User data received:', userData)
          setCurrentUser(userData)
        } else {
          const errorData = await response.json()
          console.error('AdminPanel - Failed to fetch user data:', errorData)
        }
      } catch (error) {
        console.error('AdminPanel - Error in fetchUserData:', error)
      }
    }

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

    fetchUserData()
    fetchPendingCount()
  }, [])

  // Funzione helper per verificare se l'utente può vedere una sezione
  const canAccess = (permission: keyof Permission): boolean => {
    if (!currentUser) {
      console.log(`canAccess(${permission}): No currentUser`)
      return false
    }
    if (currentUser.ruolo === 'superadmin') {
      console.log(`canAccess(${permission}): Superadmin - always true`)
      return true
    }
    const result = currentUser.permessi?.[permission] ?? false
    console.log(`canAccess(${permission}):`, result)
    return result
  }

  // Calcola quali menu mostrare
  const showMenu = canAccess('puoGestireMenu')
  const showFooter = canAccess('puoGestireFooter')
  const showTheme = canAccess('puoGestireTemi')
  const showCompany = canAccess('puoGestireDatiAzienda')
  const showReservations = canAccess('puoGestirePrenotazioni')
  const showUsers = canAccess('puoGestireProfili')

  console.log('AdminPanel - Menu visibility:', {
    showMenu,
    showFooter,
    showTheme,
    showCompany,
    showReservations,
    showUsers,
    currentUser: currentUser?.email,
    ruolo: currentUser?.ruolo
  })

  // Calcola il numero di colonne per la griglia
  const visibleTabs = [showMenu, showFooter, showTheme, showCompany, showReservations, showUsers].filter(Boolean).length
  const gridCols = Math.max(visibleTabs, 1)

  // Trova il primo tab visibile come default
  const getDefaultValue = () => {
    if (showMenu) return 'menu'
    if (showFooter) return 'footer'
    if (showTheme) return 'theme'
    if (showCompany) return 'company'
    if (showReservations) return 'reservations'
    if (showUsers) return 'users'
    return 'menu'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Pannello Amministratore
            {currentUser && currentUser.ruolo !== 'superadmin' && (
              <span className="ml-3 text-sm font-normal opacity-80">
                ({currentUser.nome})
              </span>
            )}
          </h1>
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
          <Tabs defaultValue={getDefaultValue()} className="w-full">
            <TabsList className={`grid w-full grid-cols-${gridCols} mb-6`}>
              {showMenu && (
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Menu
                </TabsTrigger>
              )}
              {showFooter && (
                <TabsTrigger value="footer" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Footer
                </TabsTrigger>
              )}
              {showTheme && (
                <TabsTrigger value="theme" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Temi
                </TabsTrigger>
              )}
              {showCompany && (
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Dati Azienda
                </TabsTrigger>
              )}
              {showReservations && (
                <TabsTrigger value="reservations" className="flex items-center gap-2 relative">
                  <Calendar className="w-4 h-4" />
                  Prenotazioni
                  {pendingCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 !min-w-[20px] !h-[20px] !px-1.5 !py-0 !text-[10px] !rounded-full !flex !items-center !justify-center !border-2 !border-white"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {showUsers && (
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Profili
                </TabsTrigger>
              )}
            </TabsList>

            {showMenu && (
              <TabsContent value="menu">
                <AdminMenu />
              </TabsContent>
            )}

            {showFooter && (
              <TabsContent value="footer">
                <AdminFooter />
              </TabsContent>
            )}

            {showTheme && (
              <TabsContent value="theme">
                <AdminTheme />
              </TabsContent>
            )}

            {showCompany && (
              <TabsContent value="company">
                <AdminCompanyData />
              </TabsContent>
            )}

            {showReservations && (
              <TabsContent value="reservations">
                <AdminReservations />
              </TabsContent>
            )}

            {showUsers && (
              <TabsContent value="users">
                <AdminUsers />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
