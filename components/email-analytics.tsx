"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportModal } from "./export-modal"
import { Loader } from "./loader"

interface EmailBlast {
  id: string
  subject: string
  sendDate: string
  totalSent: number
  openRate: string
  clickRate: string
}

interface Contact {
  name: string
  email: string
  owner: string
  clicks?: number
  bounceReason?: string
}

interface EmailAnalyticsProps {
  dateRange: { startDate: string; endDate: string }
}

export function EmailAnalytics({ dateRange }: EmailAnalyticsProps) {
  const [loading, setLoading] = useState(true)
  const [blasts, setBlasts] = useState<EmailBlast[]>([])
  const [selectedBlastId, setSelectedBlastId] = useState<string>("")
  const [selectedBlast, setSelectedBlast] = useState<EmailBlast | null>(null)
  const [clickers, setClickers] = useState<Contact[]>([])
  const [bounces, setBounces] = useState<Contact[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] EmailAnalytics: Starting data fetch")
    const fetchBlasts = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[v0] EmailAnalytics: Fetching blasts from API...")
        const params = new URLSearchParams()
        if (dateRange.startDate) params.append("startDate", dateRange.startDate)
        if (dateRange.endDate) params.append("endDate", dateRange.endDate)
        const queryString = params.toString() ? `?${params.toString()}` : ""

        const data = await fetch(`/api/ontraport/email-blasts${queryString}`).then((r) => {
          console.log("[v0] Email blasts response status:", r.status)
          return r.json()
        })
        console.log("[v0] EmailAnalytics: Blasts fetched successfully", data)
        setBlasts(data)
        if (data.length > 0) {
          setSelectedBlastId(data[0].id)
        }
      } catch (err) {
        console.error("[v0] Error fetching email blasts:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      }
      setLoading(false)
    }
    fetchBlasts()
  }, [dateRange])

  useEffect(() => {
    if (!selectedBlastId) return

    console.log("[v0] EmailAnalytics: Fetching blast details for ID:", selectedBlastId)
    const fetchBlastDetails = async () => {
      try {
        const data = await fetch(`/api/ontraport/email-blasts/${selectedBlastId}`).then((r) => {
          console.log("[v0] Blast details response status:", r.status)
          return r.json()
        })
        console.log("[v0] EmailAnalytics: Blast details fetched", data)
        setSelectedBlast(data.blast)
        setClickers(data.clickers)
        setBounces(data.bounces)
      } catch (err) {
        console.error("[v0] Error fetching blast details:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch blast details")
      }
    }
    fetchBlastDetails()
  }, [selectedBlastId])

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

  return (
    <div className="space-y-8">
      {/* Email Blast Selector */}
      <div className="rounded-[18px] border border-border bg-card p-8">
        <div className="mb-6">
          <label className="mb-2 block text-[15px] text-muted-foreground">Select Email Blast</label>
          <select
            value={selectedBlastId}
            onChange={(e) => setSelectedBlastId(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-[15px] text-foreground outline-none transition-all hover:border-ring focus:border-ring"
          >
            {blasts.map((blast) => (
              <option key={blast.id} value={blast.id}>
                {blast.subject} - {blast.sendDate}
              </option>
            ))}
          </select>
        </div>

        {selectedBlast && (
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-[13px] tracking-wide text-muted-foreground">Total Sent</div>
              <div className="mt-2 text-[22px] font-semibold text-foreground">
                {selectedBlast.totalSent.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-[13px] tracking-wide text-muted-foreground">Open Rate</div>
              <div className="mt-2 text-[22px] font-semibold text-primary">{selectedBlast.openRate}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-[13px] tracking-wide text-muted-foreground">Click Rate</div>
              <div className="mt-2 text-[22px] font-semibold text-secondary">{selectedBlast.clickRate}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="text-[13px] tracking-wide text-muted-foreground">Send Date</div>
              <div className="mt-2 text-[15px] font-medium text-foreground">{selectedBlast.sendDate}</div>
            </div>
          </div>
        )}
      </div>

      {/* Clickers and Bounces */}
      <div className="grid grid-cols-2 gap-6">
        {/* Clickers Card */}
        <div className="rounded-[18px] border border-border bg-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[18px] font-medium text-foreground">Clickers</h3>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-[13px] font-semibold text-primary">
              {clickers.length} contacts
            </div>
          </div>
          <div className="space-y-2">
            {clickers.map((contact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-muted p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-foreground">{contact.name}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{contact.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] text-muted-foreground">Owner</div>
                  <div className="text-[15px] text-[rgba(255,255,255,0.65)]">{contact.owner}</div>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-[13px] text-muted-foreground">Clicks</div>
                  <div className="text-[18px] font-semibold text-primary">{contact.clicks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hard Bounces Card */}
        <div className="rounded-[18px] border border-border bg-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[18px] font-medium text-foreground">Hard Bounces</h3>
            <div className="rounded-full bg-destructive/10 px-3 py-1 text-[13px] font-semibold text-destructive">
              {bounces.length} bounces
            </div>
          </div>
          <div className="space-y-2">
            {bounces.map((contact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-muted p-4 transition-colors hover:border-destructive/50"
              >
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-foreground">{contact.name}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{contact.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] text-muted-foreground">Reason</div>
                  <div className="text-[13px] text-destructive">{contact.bounceReason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowExportModal(true)}
          size="lg"
          className="group bg-primary text-primary-foreground shadow-[0_0_18px_rgba(24,242,196,0.35)] transition-all hover:shadow-[0_0_24px_rgba(24,242,196,0.55)]"
        >
          <Download className="mr-2 h-5 w-5" />
          Export CSV by Account Owner
        </Button>
      </div>

      {showExportModal && <ExportModal clickers={clickers} onClose={() => setShowExportModal(false)} />}
    </div>
  )
}
