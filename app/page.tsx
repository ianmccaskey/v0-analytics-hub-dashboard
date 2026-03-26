"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { GAOverview } from "@/components/ga-overview"
import { PageEngagement } from "@/components/page-engagement"
import { EmailAnalytics } from "@/components/email-analytics"
import { OverviewSettings } from "@/components/overview-settings"
import { SocialMediaEngagement } from "@/components/social-media-engagement"
import { GAComparisons } from "@/components/ga-comparisons"
import { ErrorBoundary } from "@/components/error-boundary"
import { DateRangeSelector } from "@/components/date-range-selector"
import { BarChart3, FileText, Mail, LogOut, Settings, Share2, TrendingUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type View =
  | "ga-overview"
  | "ga-comparisons"
  | "overview-settings"
  | "page-engagement"
  | "email-analytics"
  | "social-media"

export default function AnalyticsHub() {
  const { data: session } = useSession()
  const [currentView, setCurrentView] = useState<View>("ga-overview")
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })

  console.log("[v0] Analytics Hub rendered, current view:", currentView)

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log("[v0] Date range changed:", startDate, "to", endDate)
    setDateRange({ startDate, endDate })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Analytics Hub</h1>
          </div>

          <nav className="space-y-2">
            <div className="space-y-1">
              <button
                onClick={() => setCurrentView("ga-overview")}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                  currentView === "ga-overview"
                    ? "bg-primary/10 text-primary shadow-[0_0_18px_rgba(24,242,196,0.3)]"
                    : "text-[rgba(255,255,255,0.65)] hover:bg-muted hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-[15px] font-medium">GA Overview</span>
              </button>

              <button
                onClick={() => setCurrentView("ga-comparisons")}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 pl-12 text-left transition-all ${
                  currentView === "ga-comparisons"
                    ? "bg-primary/10 text-primary shadow-[0_0_18px_rgba(24,242,196,0.3)]"
                    : "text-[rgba(255,255,255,0.5)] hover:bg-muted hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-[14px] font-medium">Comparisons</span>
              </button>

              <button
                onClick={() => setCurrentView("overview-settings")}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 pl-12 text-left transition-all ${
                  currentView === "overview-settings"
                    ? "bg-primary/10 text-primary shadow-[0_0_18px_rgba(24,242,196,0.3)]"
                    : "text-[rgba(255,255,255,0.5)] hover:bg-muted hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="text-[14px] font-medium">Overview Settings</span>
              </button>
            </div>

            <button
              onClick={() => setCurrentView("page-engagement")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                currentView === "page-engagement"
                  ? "bg-secondary/10 text-secondary shadow-[0_0_18px_rgba(61,165,255,0.3)]"
                  : "text-[rgba(255,255,255,0.65)] hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="text-[15px] font-medium">Page Engagement</span>
            </button>

            <button
              onClick={() => setCurrentView("email-analytics")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                currentView === "email-analytics"
                  ? "bg-primary/10 text-primary shadow-[0_0_18px_rgba(24,242,196,0.3)]"
                  : "text-[rgba(255,255,255,0.65)] hover:bg-muted hover:text-foreground"
              }`}
            >
              <Mail className="h-5 w-5" />
              <span className="text-[15px] font-medium">Email Analytics</span>
            </button>

            {/* Social Media Engagement navigation button */}
            <button
              onClick={() => setCurrentView("social-media")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                currentView === "social-media"
                  ? "bg-primary/10 text-primary shadow-[0_0_18px_rgba(24,242,196,0.3)]"
                  : "text-[rgba(255,255,255,0.65)] hover:bg-muted hover:text-foreground"
              }`}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-[15px] font-medium">Social Media Engagement</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64">
          {/* Header Bar */}
          <header className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-medium text-foreground">
                  {currentView === "ga-overview" && "GA Overview"}
                  {currentView === "ga-comparisons" && "GA Overview – Comparisons"}
                  {currentView === "overview-settings" && "GA Overview Settings"}
                  {currentView === "page-engagement" && "Page Engagement"}
                  {currentView === "email-analytics" && "Email Analytics"}
                  {currentView === "social-media" && "Social Media Engagement"}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {currentView !== "overview-settings" && currentView !== "ga-comparisons" && (
                  <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <span className="text-sm font-medium text-foreground">
                        {session?.user?.name
                          ? session.user.name.charAt(0).toUpperCase()
                          : session?.user?.email?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {session?.user?.name && (
                          <p className="text-sm font-medium">{session.user.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{session?.user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* View Content */}
          <div className="p-8">
            <ErrorBoundary>
              {currentView === "ga-overview" && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-4">GA4 Integration Status</h3>
                  <p className="text-muted-foreground">
                    GA4 analytics are currently disabled due to placeholder credentials.
                    Configure real Google Analytics credentials in settings to enable.
                  </p>
                </div>
              )}
              {currentView === "ga-comparisons" && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-4">GA4 Comparisons</h3>
                  <p className="text-muted-foreground">
                    Available once GA4 credentials are configured.
                  </p>
                </div>
              )}
              {currentView === "overview-settings" && <OverviewSettings />}
              {currentView === "page-engagement" && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-4">Page Engagement</h3>
                  <p className="text-muted-foreground">
                    Page analytics will appear once GA4 credentials are configured.
                  </p>
                </div>
              )}
              {currentView === "email-analytics" && <EmailAnalytics dateRange={dateRange} />}
              {currentView === "social-media" && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-4">Social Media Engagement</h3>
                  <p className="text-muted-foreground">
                    Social analytics will appear once integrations are configured.
                  </p>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
