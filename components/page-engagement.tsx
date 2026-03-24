"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Loader } from "./loader"
import { Button } from "./ui/button"

interface PageEngagementData {
  path: string
  title: string
  views: number
  avgTime: string
  engagementDuration: string
  topReferrer: string
}

interface EntryFlow {
  entryPage: string
  nextPage: string
  percentage: number
}

interface PageEngagementProps {
  dateRange: { startDate: string; endDate: string }
}

export function PageEngagement({ dateRange }: PageEngagementProps) {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<PageEngagementData[]>([])
  const [entryFlows, setEntryFlows] = useState<EntryFlow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    console.log("[v0] PageEngagement: Starting data fetch")
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[v0] PageEngagement: Fetching from API...")
        const params = new URLSearchParams()
        if (dateRange.startDate) params.append("startDate", dateRange.startDate)
        if (dateRange.endDate) params.append("endDate", dateRange.endDate)
        const queryString = params.toString() ? `?${params.toString()}` : ""

        const data = await fetch(`/api/ga/page-engagement${queryString}`).then((r) => {
          console.log("[v0] Page engagement response status:", r.status)
          return r.json()
        })
        console.log("[v0] PageEngagement: Data fetched successfully", data)
        setPages(data.pages || [])
        setEntryFlows(data.entryFlows || [])
        setCurrentPage(1)
      } catch (err) {
        console.error("[v0] Error fetching page engagement data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
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

  const totalPages = Math.ceil(entryFlows.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedFlows = entryFlows.slice(startIndex, endIndex)

  console.log("[v0] Entry flows length:", entryFlows.length)
  console.log("[v0] Total pages:", totalPages)
  console.log("[v0] Current page:", currentPage)
  console.log("[v0] Should show pagination:", totalPages > 1)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <div className="space-y-8">
      {/* Entry Flow Visualization */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[18px] font-medium text-foreground">Top Entry Pages & Flow</h3>
        {entryFlows.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted p-8 text-center">
            <p className="text-[15px] text-muted-foreground">No entry flow data available</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedFlows.map((flow, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-lg border border-border bg-muted p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-foreground">{flow.entryPage}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{flow.percentage}% of entries</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-[15px] text-[rgba(255,255,255,0.65)]">{flow.nextPage}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">Most common next page</div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="h-9 px-3 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="px-4 text-[13px] text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 bg-transparent"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Page Engagement Table */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <h3 className="mb-6 text-[18px] font-medium text-foreground">Page Performance Metrics</h3>
        {pages.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted p-8 text-center">
            <p className="text-[15px] text-muted-foreground">No page data available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Page / Path
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Page Title
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Avg Time on Page
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Engagement Duration
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-medium tracking-wide text-muted-foreground">
                    Top Referrer
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, idx) => (
                  <tr key={idx} className="border-b border-border transition-colors hover:bg-muted/50">
                    <td className="px-6 py-5 text-[15px] font-mono text-secondary">{page.path}</td>
                    <td className="px-6 py-5 text-[15px] text-foreground">{page.title}</td>
                    <td className="px-6 py-5 text-[15px] text-[rgba(255,255,255,0.65)]">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-[15px] text-[rgba(255,255,255,0.65)]">{page.avgTime}</td>
                    <td className="px-6 py-5 text-[15px] text-[rgba(255,255,255,0.65)]">{page.engagementDuration}</td>
                    <td className="px-6 py-5 text-[13px] text-muted-foreground">{page.topReferrer}</td>
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
