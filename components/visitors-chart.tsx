"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface VisitorsChartProps {
  data: {
    labels: string[]
    data: number[]
  }
}

export function VisitorsChart({ data }: VisitorsChartProps) {
  const hasData = data && data.labels && data.labels.length > 0

  let chartData
  if (hasData) {
    chartData = data.labels.map((label, i) => ({
      month: label,
      visitors: data.data[i] || 0,
    }))
  } else {
    // Show last 30 days with zero data as placeholder
    const today = new Date()
    chartData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (29 - i))
      return {
        month: `${date.getMonth() + 1}/${date.getDate()}`,
        visitors: 0,
      }
    })
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255, 255, 255, 0.45)"
            style={{ fontSize: "13px" }}
            interval={hasData ? "preserveStartEnd" : 4}
          />
          <YAxis stroke="rgba(255, 255, 255, 0.45)" style={{ fontSize: "13px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161A20",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              color: "#FFFFFF",
            }}
            labelStyle={{ color: "#FFFFFF" }}
            itemStyle={{ color: "rgba(255, 255, 255, 0.65)" }}
            formatter={(value: number) => [`${value.toLocaleString()} Visitors`, ""]}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#3DA5FF"
            strokeWidth={3}
            dot={{ fill: "#3DA5FF", r: 4 }}
            activeDot={{ r: 6 }}
            fill="rgba(61, 165, 255, 0.1)"
          />
        </LineChart>
      </ResponsiveContainer>
      {!hasData && (
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          No visitor data available. Check your GA4 connection or wait for data to populate.
        </p>
      )}
    </div>
  )
}
