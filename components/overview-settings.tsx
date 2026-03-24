"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Check } from "lucide-react"

type Region = "north_america" | "europe" | "china"

interface OverviewPreset {
  id: string
  name: string
  ipExclusions: string[]
  regionFilter: Region[]
}

export function OverviewSettings() {
  const [ipExclusions, setIpExclusions] = useState<string[]>([])
  const [ipInput, setIpInput] = useState("")
  const [ipError, setIpError] = useState("")
  const [regionFilter, setRegionFilter] = useState<Region[]>([])
  const [presetName, setPresetName] = useState("")
  const [presets, setPresets] = useState<OverviewPreset[]>([
    {
      id: "1",
      name: "Internal Traffic Excluded – NA",
      ipExclusions: ["192.168.1.1", "10.0.0.1"],
      regionFilter: ["north_america"],
    },
    {
      id: "2",
      name: "EU Only",
      ipExclusions: [],
      regionFilter: ["europe"],
    },
  ])
  const [showPresetSuccess, setShowPresetSuccess] = useState(false)

  const validateIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    // IPv6 validation (simplified)
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

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      return
    }

    const newPreset: OverviewPreset = {
      id: Date.now().toString(),
      name: presetName,
      ipExclusions: [...ipExclusions],
      regionFilter,
    }

    setPresets([...presets, newPreset])
    setPresetName("")
    setShowPresetSuccess(true)
    setTimeout(() => setShowPresetSuccess(false), 3000)
  }

  const handleApplyPreset = (preset: OverviewPreset) => {
    setIpExclusions(preset.ipExclusions)
    setRegionFilter(preset.regionFilter)
  }

  const handleDeletePreset = (presetId: string) => {
    setPresets(presets.filter((p) => p.id !== presetId))
  }

  const handleResetToDefault = () => {
    setIpExclusions([])
    setRegionFilter([])
    setIpInput("")
    setIpError("")
    setPresetName("")
  }

  const handleRegionToggle = (region: Region) => {
    setRegionFilter((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <p className="text-[15px] text-muted-foreground">
          Configure filters and presets for your GA Overview dashboard.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* IP Address Filter */}
        <Card className="rounded-[18px] border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[18px]">IP Address Exclusions</CardTitle>
            <CardDescription>
              Add IP addresses (one per line) to exclude internal or test traffic from your GA Overview metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-input">Exclude IP Addresses</Label>
              <Textarea
                id="ip-input"
                placeholder="192.168.1.1&#10;10.0.0.1&#10;2001:0db8:85a3::8a2e:0370:7334"
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
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="north_america"
                    checked={regionFilter.includes("north_america")}
                    onCheckedChange={() => handleRegionToggle("north_america")}
                  />
                  <label
                    htmlFor="north_america"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    North America
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="europe"
                    checked={regionFilter.includes("europe")}
                    onCheckedChange={() => handleRegionToggle("europe")}
                  />
                  <label
                    htmlFor="europe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Europe
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="china"
                    checked={regionFilter.includes("china")}
                    onCheckedChange={() => handleRegionToggle("china")}
                  />
                  <label
                    htmlFor="china"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    China
                  </label>
                </div>
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

      {/* Presets Section */}
      <Card className="rounded-[18px] border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-[18px]">Overview Presets</CardTitle>
          <CardDescription>
            Presets save your current IP exclusions and region filter so you can quickly switch views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Save New Preset */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Internal Traffic Excluded – NA"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePreset} disabled={!presetName.trim()} className="flex-1">
                Save Preset
              </Button>
              <Button onClick={handleResetToDefault} variant="outline" className="flex-1 bg-transparent">
                Reset to Default
              </Button>
            </div>
            {showPresetSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
                <Check className="h-4 w-4" />
                Preset saved successfully
              </div>
            )}
          </div>

          {/* Existing Presets */}
          {presets.length > 0 && (
            <div className="space-y-3">
              <Label>Saved Presets</Label>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{preset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {preset.ipExclusions.length} IP{preset.ipExclusions.length !== 1 ? "s" : ""} • Region:{" "}
                        {getRegionLabel(preset.regionFilter)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleApplyPreset(preset)} size="sm" variant="outline">
                        Apply
                      </Button>
                      <Button
                        onClick={() => handleDeletePreset(preset.id)}
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
