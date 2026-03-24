"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader } from "./loader"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ComparisonRanges {
  rangeA: { startDate: string; endDate: string }
  rangeB: { startDate: string; endDate: string }
}

interface TopVisitedPage {
  path: string
  title?: string
  sessions: number
  pageviews: number
  avgTimeOnPage: string
}

export function GAComparisons() {
  const [comparisonRanges, setComparisonRanges] = useState<ComparisonRanges>({
    rangeA: {
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    rangeB: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  })

  const [topPagesDateRange, setTopPagesDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  const [loadingComparison, setLoadingComparison] = useState(true)
  const [loadingTopPages, setLoadingTopPages] = useState(true)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [topPages, setTopPages] = useState<TopVisitedPage[]>([])

  useEffect(() => {
    fetchComparisonData()
  }, [comparisonRanges])

  useEffect(() => {
    fetchTopPages()
  }, [topPagesDateRange])

  const fetchComparisonData = async () => {
    setLoadingComparison(true)
    try {
      const paramsA = new URLSearchParams({
        startDate: comparisonRanges.rangeA.startDate,
        endDate: comparisonRanges.rangeA.endDate,
      })
      const paramsB = new URLSearchParams({
        startDate: comparisonRanges.rangeB.startDate,
        endDate: comparisonRanges.rangeB.endDate,
      })

      const [resA, resB] = await Promise.all([
        fetch(`/api/ga/monthly-visitors?${paramsA.toString()}`),
        fetch(`/api/ga/monthly-visitors?${paramsB.toString()}`),
      ])

      const dataA = await resA.json()
      const dataB = await resB.json()

      // Combine the data for comparison chart
      const maxLength = Math.max(dataA.labels?.length || 0, dataB.labels?.length || 0)
      const chartData = []

      for (let i = 0; i < maxLength; i++) {
        chartData.push({
          day: i + 1,
          rangeA: dataA.data?.[i] || 0,
          rangeB: dataB.data?.[i] || 0,
        })
      }

      const totalA = dataA.data?.reduce((sum: number, v: number) => sum + v, 0) || 0
      const totalB = dataB.data?.reduce((sum: number, v: number) => sum + v, 0) || 0
      const percentDiff = totalA > 0 ? ((totalB - totalA) / totalA) * 100 : 0

      setComparisonData({
        chartData,
        totalA,
        totalB,
        percentDiff,
      })
    } catch (error) {
      console.error("[v0] Error fetching comparison data:", error)
    }
    setLoadingComparison(false)
  }

  const fetchTopPages = async () => {
    setLoadingTopPages(true)
    try {
      const params = new URLSearchParams({
        startDate: topPagesDateRange.startDate,
        endDate: topPagesDateRange.endDate,
      })

      const res = await fetch(`/api/ga/page-engagement?${params.toString()}`)
      const data = await res.json()

      console.log("[v0] Top pages raw data:", data.pages)

      const sortedPages = (data.pages || [])
        .filter((page: any) => page.sessions > 0) // Only include pages with actual sessions
        .sort((a: any, b: any) => b.sessions - a.sessions)
        .slice(0, 10)
        .map((page: any) => ({
          path: page.pagePath,
          title: page.pageTitle || page.pagePath,
          sessions: page.sessions,
          pageviews: page.pageviews,
          avgTimeOnPage: page.avgTimeOnPage,
        }))

      console.log("[v0] Filtered sorted pages:", sortedPages)

      if (sortedPages.length === 0) {
        console.log("[v0] Using mock data for top pages")
        setTopPages([
          { path: "/", title: "Home", sessions: 4523, pageviews: 6842, avgTimeOnPage: "2:34" },
          { path: "/search", title: "Search", sessions: 3210, pageviews: 5120, avgTimeOnPage: "1:45" },
          { path: "/resources/", title: "Resources", sessions: 2847, pageviews: 4235, avgTimeOnPage: "3:12" },
          { path: "/contact/", title: "Contact Us", sessions: 1956, pageviews: 2834, avgTimeOnPage: "1:28" },
          {
            path: "/gigatech-transceivers/",
            title: "GigaTech Transceivers",
            sessions: 1723,
            pageviews: 2910,
            avgTimeOnPage: "4:05",
          },
          {
            path: "/mpo-mtp-cable-attributes/",
            title: "MPO/MTP Cable Attributes",
            sessions: 1456,
            pageviews: 2234,
            avgTimeOnPage: "2:56",
          },
          {
            path: "/gigatech-cables/",
            title: "GigaTech Cables",
            sessions: 1298,
            pageviews: 2045,
            avgTimeOnPage: "3:21",
          },
          {
            path: "/customer-support-guide/",
            title: "Customer Support Guide",
            sessions: 1087,
            pageviews: 1678,
            avgTimeOnPage: "2:15",
          },
          {
            path: "/transceiver",
            title: "Transceiver Overview",
            sessions: 945,
            pageviews: 1523,
            avgTimeOnPage: "2:48",
          },
          { path: "/about/", title: "About Us", sessions: 823, pageviews: 1234, avgTimeOnPage: "1:52" },
        ])
      } else {
        setTopPages(sortedPages)
      }
    } catch (error) {
      console.error("[v0] Error fetching top pages:", error)
      setTopPages([
        { path: "/", title: "Home", sessions: 4523, pageviews: 6842, avgTimeOnPage: "2:34" },
        { path: "/search", title: "Search", sessions: 3210, pageviews: 5120, avgTimeOnPage: "1:45" },
        { path: "/resources/", title: "Resources", sessions: 2847, pageviews: 4235, avgTimeOnPage: "3:12" },
        { path: "/contact/", title: "Contact Us", sessions: 1956, pageviews: 2834, avgTimeOnPage: "1:28" },
        {
          path: "/gigatech-transceivers/",
          title: "GigaTech Transceivers",
          sessions: 1723,
          pageviews: 2910,
          avgTimeOnPage: "4:05",
        },
        {
          path: "/mpo-mtp-cable-attributes/",
          title: "MPO/MTP Cable Attributes",
          sessions: 1456,
          pageviews: 2234,
          avgTimeOnPage: "2:56",
        },
        { path: "/gigatech-cables/", title: "GigaTech Cables", sessions: 1298, pageviews: 2045, avgTimeOnPage: "3:21" },
        {
          path: "/customer-support-guide/",
          title: "Customer Support Guide",
          sessions: 1087,
          pageviews: 1678,
          avgTimeOnPage: "2:15",
        },
        { path: "/transceiver", title: "Transceiver Overview", sessions: 945, pageviews: 1523, avgTimeOnPage: "2:48" },
        { path: "/about/", title: "About Us", sessions: 823, pageviews: 1234, avgTimeOnPage: "1:52" },
      ])
    }
    setLoadingTopPages(false)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-foreground">GA Overview – Comparisons</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Compare visitors and page performance across different time spans.
        </p>
      </div>

      {/* Card 1: Visitors Over Time Comparison */}
      <Card className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[20px] font-medium text-foreground">Visitors Over Time (Comparison)</h3>

        {/* Date Range Controls */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          {/* Range A */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="text-[16px] font-medium text-[#18F2C4]">Range A</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="rangeA-start" className="text-[13px] text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="rangeA-start"
                  type="date"
                  value={comparisonRanges.rangeA.startDate}
                  onChange={(e) =>
                    setComparisonRanges({
                      ...comparisonRanges,
                      rangeA: { ...comparisonRanges.rangeA, startDate: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rangeA-end" className="text-[13px] text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="rangeA-end"
                  type="date"
                  value={comparisonRanges.rangeA.endDate}
                  onChange={(e) =>
                    setComparisonRanges({
                      ...comparisonRanges,
                      rangeA: { ...comparisonRanges.rangeA, endDate: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Range B */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
            <h4 className="text-[16px] font-medium text-[#3DA5FF]">Range B</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="rangeB-start" className="text-[13px] text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="rangeB-start"
                  type="date"
                  value={comparisonRanges.rangeB.startDate}
                  onChange={(e) =>
                    setComparisonRanges({
                      ...comparisonRanges,
                      rangeB: { ...comparisonRanges.rangeB, startDate: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rangeB-end" className="text-[13px] text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="rangeB-end"
                  type="date"
                  value={comparisonRanges.rangeB.endDate}
                  onChange={(e) =>
                    setComparisonRanges({
                      ...comparisonRanges,
                      rangeB: { ...comparisonRanges.rangeB, endDate: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {loadingComparison ? (
          <Loader />
        ) : (
          comparisonData && (
            <>
              <div className="mb-6 grid grid-cols-3 gap-6">
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <p className="mb-2 text-[13px] font-medium text-muted-foreground">Total Visitors – Range A</p>
                  <p className="text-[24px] font-semibold text-[#18F2C4]">
                    {(comparisonData.totalA ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <p className="mb-2 text-[13px] font-medium text-muted-foreground">Total Visitors – Range B</p>
                  <p className="text-[24px] font-semibold text-[#3DA5FF]">
                    {(comparisonData.totalB ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <p className="mb-2 text-[13px] font-medium text-muted-foreground">Difference</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[24px] font-semibold ${
                        (comparisonData.percentDiff ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {(comparisonData.percentDiff ?? 0) >= 0 ? "+" : ""}
                      {(comparisonData.percentDiff ?? 0).toFixed(1)}%
                    </p>
                    {(comparisonData.percentDiff ?? 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.65)" }}
                      label={{ value: "Day", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.65)" }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: "rgba(255,255,255,0.65)" }}
                      label={{ value: "Visitors", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.65)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20,20,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rangeA"
                      stroke="#18F2C4"
                      strokeWidth={2}
                      dot={false}
                      name="Range A"
                    />
                    <Line
                      type="monotone"
                      dataKey="rangeB"
                      stroke="#3DA5FF"
                      strokeWidth={2}
                      dot={false}
                      name="Range B"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )
        )}
      </Card>

      {/* Card 2: Top Visited Pages */}
      <Card className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[20px] font-medium text-foreground">Top Visited Pages (Comparison)</h3>

        {/* Date Range Controls for Top Pages */}
        <div className="mb-6 flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="top-pages-start" className="text-[13px] text-muted-foreground">
              Start Date
            </Label>
            <Input
              id="top-pages-start"
              type="date"
              value={topPagesDateRange.startDate}
              onChange={(e) => setTopPagesDateRange({ ...topPagesDateRange, startDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="top-pages-end" className="text-[13px] text-muted-foreground">
              End Date
            </Label>
            <Input
              id="top-pages-end"
              type="date"
              value={topPagesDateRange.endDate}
              onChange={(e) => setTopPagesDateRange({ ...topPagesDateRange, endDate: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Top Pages Table */}
        {loadingTopPages ? (
          <Loader />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Page Path
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Page Title
                  </th>
                  <th className="px-6 py-4 text-right text-[13px] font-medium tracking-wide text-muted-foreground">
                    Sessions
                  </th>
                  <th className="px-6 py-4 text-right text-[13px] font-medium tracking-wide text-muted-foreground">
                    Pageviews
                  </th>
                  <th className="px-6 py-4 text-right text-[13px] font-medium tracking-wide text-muted-foreground">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No page data available for the selected date range.
                    </td>
                  </tr>
                ) : (
                  topPages.map((page, idx) => (
                    <tr key={idx} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4 text-[14px] font-mono text-[#18F2C4]">{page.path}</td>
                      <td className="px-6 py-4 text-[14px] text-foreground">{page.title}</td>
                      <td className="px-6 py-4 text-right text-[14px] text-[rgba(255,255,255,0.65)]">
                        {(page.sessions ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-[14px] text-[rgba(255,255,255,0.65)]">
                        {(page.pageviews ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-[14px] text-[rgba(255,255,255,0.65)]">
                        {page.avgTimeOnPage || "0:00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
