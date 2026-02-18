'use client'

import { useState } from 'react'
import { X, LayoutDashboard, Utensils, MapPin, ImageIcon, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminMenu from './AdminMenu'
import AdminFooter from './AdminFooter'
import AdminTheme from './AdminTheme'
import AdminUsers from './AdminUsers'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
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
                Temi & Immagini
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

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
