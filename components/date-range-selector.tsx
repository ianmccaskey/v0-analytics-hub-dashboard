"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "lucide-react"

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
}

export function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatDate(today))

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)
    onDateRangeChange(newStartDate, endDate)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value
    setEndDate(newEndDate)
    onDateRangeChange(startDate, newEndDate)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <input
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        max={endDate}
        className="bg-transparent text-[15px] text-foreground outline-none"
      />
      <span className="text-[15px] text-muted-foreground">to</span>
      <input
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        min={startDate}
        max={formatDate(today)}
        className="bg-transparent text-[15px] text-foreground outline-none"
      />
    </div>
  )
}
