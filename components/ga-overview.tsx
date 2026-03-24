"use client"

import { useEffect, useState } from "react"
import { VisitorsChart } from "./visitors-chart"
import { Loader } from "./loader"
import { ConnectionDiagnostic } from "./connection-diagnostic"

interface MonthlyVisitorsData {
  labels: string[]
  data: number[]
}

interface EmailCampaign {
  name: string
  sessions: number
  visitors: number
  avgEngagement: string
}

interface SummaryData {
  totalVisitors: number
  totalSessions: number
  avgTime: string
  bounceRate: string
  visitorChange: number
  sessionChange: number
  avgTimeChange: number
  bounceChange: number
}

interface GAOverviewProps {
  dateRange: { startDate: string; endDate: string }
}

export function GAOverview({ dateRange }: GAOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [visitorsData, setVisitorsData] = useState<MonthlyVisitorsData | null>(null)
  const [emailTraffic, setEmailTraffic] = useState<EmailCampaign[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] GAOverview: Starting data fetch")
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[v0] GAOverview: Fetching from APIs...")
        const params = new URLSearchParams()
        if (dateRange.startDate) params.append("startDate", dateRange.startDate)
        if (dateRange.endDate) params.append("endDate", dateRange.endDate)
        const queryString = params.toString() ? `?${params.toString()}` : ""

        const [visitorsRes, campaignsRes, summaryRes] = await Promise.all([
          fetch(`/api/ga/monthly-visitors${queryString}`),
          fetch(`/api/ga/ontraport-email-traffic${queryString}`),
          fetch(`/api/ga/summary${queryString}`),
        ])

        let visitors = { labels: [], data: [] }
        let campaigns: EmailCampaign[] = []
        let summaryData = null

        if (visitorsRes.ok) {
          const text = await visitorsRes.text()
          try {
            visitors = JSON.parse(text)
            console.log("[v0] Visitors data:", visitors)
          } catch (e) {
            console.error("[v0] Failed to parse visitors response:", text)
          }
        }

        if (campaignsRes.ok) {
          const text = await campaignsRes.text()
          try {
            campaigns = JSON.parse(text)
            console.log("[v0] Campaigns data:", campaigns)
          } catch (e) {
            console.error("[v0] Failed to parse campaigns response:", text)
          }
        }

        if (summaryRes.ok) {
          const text = await summaryRes.text()
          try {
            summaryData = JSON.parse(text)
            console.log("[v0] Summary data:", summaryData)
          } catch (e) {
            console.error("[v0] Failed to parse summary response:", text)
          }
        }

        setVisitorsData(visitors)
        setEmailTraffic(campaigns)
        setSummary(summaryData)
      } catch (error) {
        console.error("[v0] Error fetching GA4 data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch data")
      }
      setLoading(false)
    }
    fetchData()
  }, [dateRange])

  if (loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="text-destructive">Error loading data: {error}</p>
      </div>
    )
  }

  const totalEmailVisitors = emailTraffic.reduce((sum, campaign) => sum + campaign.visitors, 0)
  const hasVisitorData =
    visitorsData && visitorsData.data && visitorsData.data.length > 0 && visitorsData.data.some((v) => v > 0)

  console.log("[v0] Data status:", { hasVisitorData, visitorsData, summary })

  return (
    <div className="space-y-8">
      {!hasVisitorData && <ConnectionDiagnostic />}

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="group rounded-[18px] border border-border bg-card p-8 transition-all hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(24,242,196,0.15)]">
          <h3 className="mb-4 text-[18px] font-medium text-muted-foreground">Total Visitors (30d)</h3>
          <div className="mb-2 text-[28px] font-semibold text-[#18F2C4] drop-shadow-[0_0_18px_rgba(24,242,196,0.35)]">
            {summary?.totalVisitors.toLocaleString() || "0"}
          </div>
          <p className="text-[13px] tracking-wide text-muted-foreground">
            vs. prior 30d: {summary && summary.visitorChange > 0 ? "+" : ""}
            {summary?.visitorChange.toFixed(1)}%
          </p>
        </div>

        <div className="group rounded-[18px] border border-border bg-card p-8 transition-all hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(61,165,255,0.15)]">
          <h3 className="mb-4 text-[18px] font-medium text-muted-foreground">Avg Session Duration</h3>
          <div className="mb-2 text-[28px] font-semibold text-[#3DA5FF] drop-shadow-[0_0_18px_rgba(61,165,255,0.35)]">
            {summary?.avgTime || "0:00"}
          </div>
          <p className="text-[13px] tracking-wide text-muted-foreground">
            {summary && summary.avgTimeChange > 0 ? "Trending upward" : "Needs improvement"}
          </p>
        </div>

        <div className="group rounded-[18px] border border-border bg-card p-8 transition-all hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(24,242,196,0.15)]">
          <h3 className="mb-4 text-[18px] font-medium text-muted-foreground">Email-Attributed Visitors</h3>
          <div className="mb-2 text-[28px] font-semibold text-[#18F2C4] drop-shadow-[0_0_18px_rgba(24,242,196,0.35)]">
            {totalEmailVisitors.toLocaleString()}
          </div>
          <p className="text-[13px] tracking-wide text-muted-foreground">From email campaigns</p>
        </div>
      </div>

      {/* Visitors Chart */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[18px] font-medium text-foreground">Visitors over last 30 days</h3>
        <VisitorsChart data={visitorsData || { labels: [], data: [] }} />
      </div>

      {/* Email Attribution Section */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[18px] font-medium text-foreground">Traffic from Email Campaigns</h3>
        {emailTraffic.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted p-8 text-center">
            <p className="text-[15px] text-muted-foreground">
              No email campaign traffic found. Make sure your campaigns are tagged with utm_medium=email
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Campaign Name
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Sessions
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Visitors
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Avg Engagement Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {emailTraffic.map((campaign, idx) => (
                  <tr key={idx} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4 text-[15px] text-foreground">{campaign.name}</td>
                    <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                      {campaign.sessions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">
                      {campaign.visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[15px] text-[rgba(255,255,255,0.65)]">{campaign.avgEngagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
