"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Check, Loader2 } from "lucide-react"

type Region = "north_america" | "europe" | "china"

export function OverviewSettings() {
  const [ipExclusions, setIpExclusions] = useState<string[]>([])
  const [ipInput, setIpInput] = useState("")
  const [ipError, setIpError] = useState("")
  const [regionFilter, setRegionFilter] = useState<Region[]>([])
  const [ga4PropertyId, setGa4PropertyId] = useState("")
  const [ga4ClientEmail, setGa4ClientEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.ip_allowlist)) setIpExclusions(data.ip_allowlist)
      if (Array.isArray(data.region_filters)) setRegionFilter(data.region_filters)
      if (typeof data.ga4_property_id === "string") setGa4PropertyId(data.ga4_property_id)
      if (typeof data.ga4_client_email === "string") setGa4ClientEmail(data.ga4_client_email)
    } catch (err) {
      console.error("[OverviewSettings] Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const validateIP = (ip: string): boolean => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  const handleAddIP = () => {
    const ips = ipInput.split("\n").filter((ip) => ip.trim())
    const invalidIPs = ips.filter((ip) => !validateIP(ip.trim()))

    if (invalidIPs.length > 0) {
      setIpError(`Invalid IP format: ${invalidIPs.join(", ")}`)
      return
    }

    setIpExclusions([...ipExclusions, ...ips.map((ip) => ip.trim())])
    setIpInput("")
    setIpError("")
  }

  const handleRemoveIP = (ipToRemove: string) => {
    setIpExclusions(ipExclusions.filter((ip) => ip !== ipToRemove))
  }

  const handleRegionToggle = (region: Region) => {
    setRegionFilter((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip_allowlist: ipExclusions,
          region_filters: regionFilter,
          ...(ga4PropertyId && { ga4_property_id: ga4PropertyId }),
          ...(ga4ClientEmail && { ga4_client_email: ga4ClientEmail }),
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("[OverviewSettings] Failed to save:", err)
      setSaveError("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setIpExclusions([])
    setRegionFilter([])
    setIpInput("")
    setIpError("")
  }

  const getRegionLabel = (regions: Region[]): string => {
    if (regions.length === 0) return "All Regions"
    const labels: Record<Region, string> = {
      north_america: "North America",
      europe: "Europe",
      china: "China",
    }
    return regions.map((r) => labels[r]).join(", ")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[15px] text-muted-foreground">
          Configure filters and settings for your GA Overview dashboard.
        </p>
      </div>

      {/* GA4 Connection Settings */}
      <Card className="rounded-[18px] border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-[18px]">GA4 Connection</CardTitle>
          <CardDescription>
            Override the GA4 property ID and service account email stored in settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ga4-property">GA4 Property ID</Label>
              <Input
                id="ga4-property"
                placeholder="properties/123456789"
                value={ga4PropertyId}
                onChange={(e) => setGa4PropertyId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ga4-email">Service Account Email</Label>
              <Input
                id="ga4-email"
                type="email"
                placeholder="service@project.iam.gserviceaccount.com"
                value={ga4ClientEmail}
                onChange={(e) => setGa4ClientEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* IP Address Filter */}
        <Card className="rounded-[18px] border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[18px]">IP Address Exclusions</CardTitle>
            <CardDescription>
              Add IP addresses (one per line) to exclude internal or test traffic from your GA
              Overview metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-input">Exclude IP Addresses</Label>
              <Textarea
                id="ip-input"
                placeholder={"192.168.1.1\n10.0.0.1\n2001:0db8:85a3::8a2e:0370:7334"}
                value={ipInput}
                onChange={(e) => {
                  setIpInput(e.target.value)
                  setIpError("")
                }}
                className="min-h-[100px] font-mono text-sm"
              />
              {ipError && <p className="text-sm text-destructive">{ipError}</p>}
              <Button onClick={handleAddIP} size="sm" className="w-full">
                Add IP Addresses
              </Button>
            </div>

            {ipExclusions.length > 0 && (
              <div className="space-y-2">
                <Label>Current Exclusions</Label>
                <div className="flex flex-wrap gap-2">
                  {ipExclusions.map((ip) => (
                    <Badge key={ip} variant="secondary" className="gap-1 pr-1">
                      <span className="font-mono text-xs">{ip}</span>
                      <button
                        onClick={() => handleRemoveIP(ip)}
                        className="ml-1 rounded-sm hover:bg-muted"
                        aria-label={`Remove ${ip}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Region Filter */}
        <Card className="rounded-[18px] border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[18px]">Region Filter</CardTitle>
            <CardDescription>Filter your analytics data by geographic region.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Regions</Label>
              <div className="space-y-3">
                {(
                  [
                    { id: "north_america", label: "North America" },
                    { id: "europe", label: "Europe" },
                    { id: "china", label: "China" },
                  ] as { id: Region; label: string }[]
                ).map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-3">
                    <Checkbox
                      id={id}
                      checked={regionFilter.includes(id)}
                      onCheckedChange={() => handleRegionToggle(id)}
                    />
                    <label
                      htmlFor={id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {regionFilter.length === 0
                  ? "No regions selected (showing all regions)"
                  : "Region filter applies to all charts and tables in GA Overview."}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Current Filter</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {ipExclusions.length} IP{ipExclusions.length !== 1 ? "s" : ""} excluded • Region:{" "}
                {getRegionLabel(regionFilter)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save / Reset */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
        <Button onClick={handleReset} variant="outline" className="bg-transparent">
          Reset Filters
        </Button>

        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            <Check className="h-4 w-4" />
            Settings saved
          </div>
        )}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      </div>
    </div>
  )
}
