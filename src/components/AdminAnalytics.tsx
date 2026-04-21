'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  Globe,
  ShoppingCart,
  Target,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  period: string
  summary: {
    totalVisits: number
    uniqueVisitors: number
    avgSessionDuration: number
    avgDailyVisits: number
    bestHourOfDay: number | null
    bestDayOfWeek: string | null
    growthRate: number
    conversionRate: string
  }
  dailyData?: Array<{
    date: string
    visits: number
    uniqueVisitors: number
    avgDuration: number
  }>
  weeklyData?: Array<{
    weekStart: string
    weekEnd: string
    visits: number
    avgDailyVisits: number
  }>
  monthlyData?: Array<{
    month: string
    year: number
    visits: number
    uniqueVisitors: number
    growthRate: number
  }>
  yearlyData?: Array<{
    year: number
    visits: number
    uniqueVisitors: number
    trend: string
  }>
  topPages?: Array<{ page: string; views: number }>
  topProducts?: Array<{ id: string; views: number; avgDuration: number }>
  conversionInsights?: Array<{
    productId: string
    productName: string
    viewed: number
    cart: number
    conversionRate: number
  }>
  priceInsights?: Record<string, string>
}

interface Product {
  id: string
  nome: string
  prezzo: number
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [aggregating, setAggregating] = useState(false)
  const [period, setPeriod] = useState('daily')
  const [days, setDays] = useState(30)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchData()
    fetchProducts()
  }, [period, days])

  async function fetchData() {
    setLoading(true)
    try {
      const url = `/api/admin/analytics?period=${period}&days=${days}`
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Errore nel recupero analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/admin/articoli')
      if (response.ok) {
        const result = await response.json()
        setProducts(result)
      }
    } catch (error) {
      console.error('Errore nel recupero prodotti:', error)
    }
  }

  async function forceAggregation() {
    setAggregating(true)
    try {
      const response = await fetch('/api/admin/analytics/aggregate', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'Aggregazione completata!')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      console.error('Errore nell\'aggregazione:', error)
      alert('Errore nell\'aggregazione dei dati')
    } finally {
      setAggregating(false)
    }
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  function formatDurationMinutes(seconds: number): string {
    return `${Math.round(seconds / 60)}m`
  }

  function getTrendIcon(rate: number) {
    if (rate > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (rate < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  function getTrendColor(rate: number): string {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  function getPriceInsightBadge(productId: string): React.ReactElement | null {
    const color = data?.priceInsights?.[productId]
    if (!color) return null

    const badgeConfig = {
      red: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: AlertTriangle,
        label: 'Costoso'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Target,
        label: 'Medio'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: TrendingUp,
        label: 'Ottimo'
      }
    }

    const config = badgeConfig[color as keyof typeof badgeConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge className={`${config.bg} ${config.text} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  function getProductName(productId: string): string {
    const product = products.find(p => p.id === productId)
    return product?.nome || productId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data || data.summary.totalVisits === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analisi dell'utilizzo del sito (anonima)
            </p>
          </div>
          <Button
            onClick={forceAggregation}
            disabled={aggregating}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${aggregating ? 'animate-spin' : ''}`} />
            {aggregating ? 'Aggregazione in corso...' : 'Aggrega Dati'}
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Nessun dato disponibile</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Non ci sono ancora dati aggregati per questo periodo.
          </p>
          <p className="text-sm text-gray-600">
            Clicca il pulsante <strong>"Aggrega Dati"</strong> per generare le statistiche dalle visite registrate.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            ℹ️ Naviga sul sito per raccogliere i dati di utilizzo.
          </p>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>ℹ️ I dati sono aggregati automaticamente e rimossi dopo 15 giorni per la privacy.</p>
          <p>📊 Gli insight sui prezzi aiutano a identificare prodotti con molte visualizzazioni ma bassa conversione.</p>
        </div>
      </div>
    )
  }

  const chartConfig = {
    visits: { label: 'Visite' },
    uniqueVisitors: { label: 'Visitatori Unici' },
    avgDuration: { label: 'Durata Media' },
  }

  return (
    <div className="space-y-6">
      {/* Header con filtri */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Analisi dell'utilizzo del sito (anonima)
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={forceAggregation}
            disabled={aggregating}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${aggregating ? 'animate-spin' : ''}`} />
            {aggregating ? 'Aggregazione in corso...' : 'Aggrega Dati'}
          </Button>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Periodo:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Giornaliero</SelectItem>
                  <SelectItem value="weekly">Settimanale</SelectItem>
                  <SelectItem value="monthly">Mensile</SelectItem>
                  <SelectItem value="yearly">Annuale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === 'daily' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Giorni:</label>
                <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card statistiche riassuntive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visite Totali */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visite Totali</CardTitle>
            <Eye className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalVisits.toLocaleString()}</div>
            {data.summary.growthRate !== undefined && data.summary.growthRate !== 0 && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${getTrendColor(data.summary.growthRate)}`}>
                {getTrendIcon(data.summary.growthRate)}
                <span className="font-medium">
                  {Math.abs(data.summary.growthRate).toFixed(1)}%
                </span>
                <span className="text-gray-500">vs periodo precedente</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitatori Unici */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Visitatori Unici</CardTitle>
            <Users className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.uniqueVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">
              {data.period === 'daily'
                ? `${Math.round((data.summary.uniqueVisitors / data.summary.totalVisits) * 100)}% visitatori ripetuti`
                : 'Visitatori unici nel periodo'
              }
            </div>
          </CardContent>
        </Card>

        {/* Durata Media Sessione */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Durata Media</CardTitle>
            <Clock className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.period === 'daily'
                ? formatDuration(data.summary.avgSessionDuration)
                : formatDurationMinutes(data.summary.avgDailyVisits as number)
              }
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {data.period === 'daily' ? 'per sessione' : 'al giorno'}
            </div>
          </CardContent>
        </Card>

        {/* Miglior Orario/Giorno */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Picco Traffico</CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.bestHourOfDay !== null
                ? `${data.summary.bestHourOfDay}:00`
                : data.summary.bestDayOfWeek || '-'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {data.summary.bestHourOfDay !== null
                ? 'Miglior orario'
                : data.summary.bestDayOfWeek
                  ? 'Miglior giorno'
                  : 'Dati insufficienti'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafico andamento */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento {period === 'daily' ? 'Giornaliero' : period === 'weekly' ? 'Settimanale' : period === 'monthly' ? 'Mensile' : 'Annuale'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                {period === 'daily' ? (
                  <AreaChart data={data.dailyData}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorVisits)"
                    />
                  </AreaChart>
                ) : period === 'weekly' ? (
                  <BarChart data={data.weeklyData}>
                    <XAxis
                      dataKey="weekStart"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="#8884d8" />
                  </BarChart>
                ) : period === 'monthly' ? (
                  <LineChart data={data.monthlyData}>
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('it-IT', { month: 'short' })}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <BarChart data={data.yearlyData}>
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="visits" fill="#8884d8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tab per i dettagli */}
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="w-full md:w-fit">
          <TabsTrigger value="pages">Pagine</TabsTrigger>
          <TabsTrigger value="products">Prodotti</TabsTrigger>
          <TabsTrigger value="conversion">Conversioni</TabsTrigger>
        </TabsList>

        {/* Tab Pagine */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Pagine Più Visitate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pagina</TableHead>
                    <TableHead className="text-right">Visite</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPages && data.topPages.length > 0 ? (
                    data.topPages.map((page, index) => {
                      const percentage = ((page.views / data.summary.totalVisits) * 100).toFixed(1)
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{page.page}</TableCell>
                          <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{percentage}%</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        Nessun dato disponibile
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Prodotti */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Prodotti Più Visti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prodotto</TableHead>
                    <TableHead className="text-right">Visualizzazioni</TableHead>
                    <TableHead className="text-right">Durata Media</TableHead>
                    <TableHead className="text-right">Insight Prezzo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts && data.topProducts.length > 0 ? (
                    data.topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {getProductName(product.id)}
                        </TableCell>
                        <TableCell className="text-right">{product.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {formatDuration(product.avgDuration)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getPriceInsightBadge(product.id)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Nessun dato disponibile
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Conversioni */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Insights Conversione
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.summary.conversionRate && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Tasso di Conversione Globale</div>
                  <div className="text-2xl font-bold">{data.summary.conversionRate}%</div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prodotto</TableHead>
                    <TableHead className="text-right">Visti</TableHead>
                    <TableHead className="text-right">Nel Carrello</TableHead>
                    <TableHead className="text-right">Conversione</TableHead>
                    <TableHead className="text-right">Insight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.conversionInsights && data.conversionInsights.length > 0 ? (
                    data.conversionInsights.map((insight, index) => {
                      const productName = getProductName(insight.productId)
                      const conversionRateColor =
                        insight.conversionRate < 20 ? 'text-red-600' :
                        insight.conversionRate < 40 ? 'text-yellow-600' : 'text-green-600'

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{productName}</TableCell>
                          <TableCell className="text-right">{insight.viewed}</TableCell>
                          <TableCell className="text-right">{insight.cart}</TableCell>
                          <TableCell className={`text-right font-medium ${conversionRateColor}`}>
                            {insight.conversionRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {insight.conversionRate < 20 && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Basso
                              </Badge>
                            )}
                            {insight.conversionRate >= 20 && insight.conversionRate < 40 && (
                              <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                                <Target className="w-3 h-3" />
                                Medio
                              </Badge>
                            )}
                            {insight.conversionRate >= 40 && (
                              <Badge className="bg-green-100 text-green-800 gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Alto
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        Nessun dato di conversione disponibile
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info note */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>ℹ️ I dati sono aggregati automaticamente e rimossi dopo 15 giorni per la privacy.</p>
        <p>📊 Gli insight sui prezzi aiutano a identificare prodotti con molte visualizzazioni ma bassa conversione.</p>
        <p>🎯 Il badge rosso indica prodotti costosi (bassa conversione), verde prodotti ben posizionati.</p>
      </div>
    </div>
  )
}
