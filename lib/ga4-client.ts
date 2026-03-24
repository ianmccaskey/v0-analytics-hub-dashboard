import { google } from "googleapis"

// Initialize the GA4 client with service account credentials
function getGA4Client() {
  console.log("[v0] Initializing GA4 client")
  console.log("[v0] GA4_CLIENT_EMAIL:", process.env.GA4_CLIENT_EMAIL ? "Set" : "Missing")
  console.log(
    "[v0] GA4_PRIVATE_KEY:",
    process.env.GA4_PRIVATE_KEY ? "Set (length: " + process.env.GA4_PRIVATE_KEY.length + ")" : "Missing",
  )

  if (!process.env.GA4_CLIENT_EMAIL || !process.env.GA4_PRIVATE_KEY) {
    throw new Error("Missing GA4 credentials: GA4_CLIENT_EMAIL or GA4_PRIVATE_KEY not set")
  }

  let privateKey = process.env.GA4_PRIVATE_KEY
  if (!privateKey.includes("\n") && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n")
  }

  console.log("[v0] Private key format check - starts with BEGIN:", privateKey.startsWith("-----BEGIN"))
  console.log("[v0] Private key format check - ends with END:", privateKey.trim().endsWith("-----"))

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GA4_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  })

  return google.analyticsdata({ version: "v1beta", auth })
}

export async function runGA4Report(
  dimensions: string[],
  metrics: string[],
  dateRanges: Array<{ startDate: string; endDate: string }>,
  orderBys?: Array<{ metric?: { metricName: string }; desc?: boolean }>,
  dimensionFilter?: any,
) {
  try {
    const analyticsData = getGA4Client()
    const propertyId = process.env.GA4_PROPERTY_ID

    console.log("[v0] GA4_PROPERTY_ID:", propertyId || "Missing")

    if (!propertyId) {
      throw new Error("GA4_PROPERTY_ID environment variable is not set")
    }

    console.log("[v0] Running GA4 report with params:", {
      property: `properties/${propertyId}`,
      dimensions,
      metrics,
      dateRanges,
    })

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges,
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        orderBys,
        dimensionFilter,
      },
    })

    console.log("[v0] GA4 API Response rows count:", response.data.rows?.length || 0)

    return response.data
  } catch (error: any) {
    console.error("[v0] GA4 API Error:", error.message)
    console.error("[v0] GA4 API Error details:", error)
    throw new Error(`GA4 API Error: ${error.message}`)
  }
}
