import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera i dati analytics per la dashboard admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly, yearly
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30

    let data: any

    switch (period) {
      case 'daily':
        data = await getDailyData(days)
        break
      case 'weekly':
        data = await getWeeklyData()
        break
      case 'monthly':
        data = await getMonthlyData()
        break
      case 'yearly':
        data = await getYearlyData()
        break
      default:
        data = await getDailyData(days)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nel recupero analytics:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli analytics' },
      { status: 500 }
    )
  }
}

// Dati giornalieri
async function getDailyData(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyData = await db.analyticsDaily.findMany({
    where: {
      date: {
        gte: startDate
      }
    },
    orderBy: { date: 'desc' }
  })

  // Calcola i totali
  const totalVisits = dailyData.reduce((sum, d) => sum + d.totalVisits, 0)
  const totalUniqueVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0)

  // Calcola media session duration sui giorni con dati
  const avgSessionDuration = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + d.avgSessionDuration, 0) / dailyData.length)
    : 0

  // Calcola la media giornaliera sul periodo selezionato (inclusivi i giorni senza dati)
  const avgDailyVisits = totalVisits / days

  // Aggrega orari migliori
  const hourlyData: Record<number, number> = {}
  dailyData.forEach(d => {
    const hourly = JSON.parse(d.hourlyBreakdown || '{}')
    Object.entries(hourly).forEach(([hour, count]) => {
      hourlyData[parseInt(hour)] = (hourlyData[parseInt(hour)] || 0) + (count as number)
    })
  })
  const bestHour = Object.entries(hourlyData).sort(([, a], [, b]) => b - a)[0]?.[0]

  // Aggrega pagine top
  const pageData: Record<string, number> = {}
  dailyData.forEach(d => {
    const pages = JSON.parse(d.pageViews || '{}')
    Object.entries(pages).forEach(([page, count]) => {
      pageData[page] = (pageData[page] || 0) + (count as number)
    })
  })
  const topPages = Object.entries(pageData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }))

  // Aggrega prodotti
  const productData: Record<string, { views: number; avgDuration: number }> = {}
  dailyData.forEach(d => {
    const products = JSON.parse(d.productViews || '{}')
    Object.entries(products).forEach(([id, data]: [string, any]) => {
      if (!productData[id]) {
        productData[id] = { views: 0, avgDuration: 0 }
      }
      productData[id].views += (data.views || 0)
      productData[id].avgDuration += (data.avgDuration || 0)
    })
  })
  // Calcola media durata
  Object.keys(productData).forEach(id => {
    if (dailyData.length > 0) {
      productData[id].avgDuration = Math.round(productData[id].avgDuration / dailyData.length)
    }
  })

  const topProducts = Object.entries(productData)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, 10)
    .map(([id, data]) => ({ id, views: data.views, avgDuration: data.avgDuration }))

  // Conversion data
  const conversionData = dailyData.map(d => JSON.parse(d.conversionData || '{}'))
  const totalViewed = conversionData.reduce((sum, d) => sum + (d.viewed || 0), 0)
  const totalCart = conversionData.reduce((sum, d) => sum + (d.cart || 0), 0)
  const conversionRate = totalViewed > 0 ? ((totalCart / totalViewed) * 100).toFixed(1) : '0'

  return {
    period: 'daily',
    summary: {
      totalVisits,
      uniqueVisitors: totalUniqueVisitors,
      avgSessionDuration,
      avgDailyVisits,
      bestHourOfDay: bestHour ? parseInt(bestHour) : null,
      bestDayOfWeek: null,
      conversionRate
    },
    dailyData: dailyData.map(d => ({
      date: d.date,
      visits: d.totalVisits,
      uniqueVisitors: d.uniqueVisitors,
      avgDuration: d.avgSessionDuration
    })),
    topPages,
    topProducts
  }
}

// Dati settimanali
async function getWeeklyData() {
  const weeks = await db.analyticsWeekly.findMany({
    orderBy: { weekStartDate: 'desc' },
    take: 12
  })

  const totalVisits = weeks.reduce((sum, w) => sum + w.totalVisits, 0)
  const uniqueVisitors = weeks.reduce((sum, w) => sum + w.uniqueVisitors, 0)
  const avgDailyVisits = weeks.length > 0
    ? (totalVisits / weeks.length).toFixed(1)
    : '0'

  // Top products da tutte le settimane
  const allProducts: Record<string, { views: number; avgDuration: number }> = {}
  weeks.forEach(w => {
    const products = JSON.parse(w.topProducts || '[]')
    products.forEach((p: any) => {
      if (!allProducts[p.id]) {
        allProducts[p.id] = { views: 0, avgDuration: 0 }
      }
      allProducts[p.id].views += (p.views || 0)
      allProducts[p.id].avgDuration += (p.avgDuration || 0)
    })
  })

  // Calcola la media delle durate
  Object.keys(allProducts).forEach(id => {
    if (weeks.length > 0) {
      allProducts[id].avgDuration = Math.round(allProducts[id].avgDuration / weeks.length)
    }
  })

  const topProducts = Object.entries(allProducts)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, 10)
    .map(([id, data]) => ({ id, views: data.views, avgDuration: data.avgDuration }))

  // Conversion insights
  const allConversionInsights: any[] = []
  weeks.forEach(w => {
    const insights = JSON.parse(w.conversionInsights || '[]')
    allConversionInsights.push(...insights)
  })

  // Price insights
  const priceInsights: Record<string, string> = {}
  weeks.forEach(w => {
    const insights = JSON.parse(w.priceInsights || '{}')
    Object.entries(insights).forEach(([id, color]) => {
      // Prendi l'ultimo insight disponibile
      priceInsights[id] = color as string
    })
  })

  return {
    period: 'weekly',
    summary: {
      totalVisits,
      uniqueVisitors,
      avgDailyVisits: parseFloat(avgDailyVisits),
      bestDayOfWeek: weeks[0]?.bestDayOfWeek || null,
      bestHourOfDay: weeks[0]?.bestHourOfDay || null
    },
    weeklyData: weeks.map(w => ({
      weekStart: w.weekStartDate,
      weekEnd: w.weekEndDate,
      visits: w.totalVisits,
      avgDailyVisits: w.avgDailyVisits
    })),
    topProducts,
    conversionInsights: allConversionInsights,
    priceInsights
  }
}

// Dati mensili
async function getMonthlyData() {
  const months = await db.analyticsMonthly.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 12
  })

  const currentMonth = months[0]
  const lastMonth = months[1]

  const totalVisits = months.reduce((sum, m) => sum + m.totalVisits, 0)
  const uniqueVisitors = months.reduce((sum, m) => sum + m.uniqueVisitors, 0)

  // Price insights
  const priceInsights: Record<string, string> = {}
  if (currentMonth) {
    const insights = JSON.parse(currentMonth.priceInsights || '{}')
    Object.assign(priceInsights, insights)
  }

  return {
    period: 'monthly',
    summary: {
      totalVisits,
      uniqueVisitors,
      avgDailyVisits: currentMonth?.avgDailyVisits || 0,
      bestDayOfWeek: currentMonth?.bestDayOfWeek || null,
      bestHourOfDay: currentMonth?.bestHourOfDay || null,
      growthRate: currentMonth?.growthRate || 0
    },
    monthlyData: months.map(m => ({
      month: m.month,
      year: m.year,
      visits: m.totalVisits,
      uniqueVisitors: m.uniqueVisitors,
      growthRate: m.growthRate
    })),
    priceInsights
  }
}

// Dati annuali
async function getYearlyData() {
  const years = await db.analyticsYearly.findMany({
    orderBy: { year: 'desc' },
    take: 5
  })

  const currentYear = years[0]

  const totalVisits = years.reduce((sum, y) => sum + y.totalVisits, 0)
  const uniqueVisitors = years.reduce((sum, y) => sum + y.uniqueVisitors, 0)

  // Price insights
  const priceInsights: Record<string, string> = {}
  if (currentYear) {
    const insights = JSON.parse(currentYear.priceInsights || '{}')
    Object.assign(priceInsights, insights)
  }

  return {
    period: 'yearly',
    summary: {
      totalVisits,
      uniqueVisitors,
      avgMonthlyVisits: currentYear?.avgMonthlyVisits || 0,
      bestMonth: currentYear?.bestMonth || null,
      overallTrend: currentYear?.overallTrend || 'stabile'
    },
    yearlyData: years.map(y => ({
      year: y.year,
      visits: y.totalVisits,
      uniqueVisitors: y.uniqueVisitors,
      trend: y.overallTrend
    })),
    priceInsights
  }
}
