import { NextResponse } from "next/server"
import { runGA4Report } from "@/lib/ga4-client"

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment_variables: {},
    authentication: {},
    api_test: {},
  }

  try {
    // Check environment variables
    diagnostics.environment_variables = {
      GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID ? `Set (${process.env.GA4_PROPERTY_ID})` : "❌ Missing",
      GA4_CLIENT_EMAIL: process.env.GA4_CLIENT_EMAIL ? `✓ Set (${process.env.GA4_CLIENT_EMAIL})` : "❌ Missing",
      GA4_PRIVATE_KEY: process.env.GA4_PRIVATE_KEY
        ? `✓ Set (${process.env.GA4_PRIVATE_KEY.length} chars)`
        : "❌ Missing",
    }

    // Check if all required variables are present
    const hasAllVars = process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY

    if (!hasAllVars) {
      diagnostics.authentication.status = "❌ Cannot authenticate - missing environment variables"
      return NextResponse.json(diagnostics, { status: 200 })
    }

    // Test a simple GA4 API call
    diagnostics.api_test.status = "Testing..."
    try {
      const response = await runGA4Report(["date"], ["activeUsers"], [{ startDate: "7daysAgo", endDate: "today" }])

      diagnostics.api_test = {
        status: "✓ Success",
        rows_returned: response.rows?.length || 0,
        sample_data: response.rows?.slice(0, 3) || [],
      }
    } catch (apiError: any) {
      diagnostics.api_test = {
        status: "❌ Failed",
        error: apiError.message,
        details: apiError.toString(),
      }
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      stack: error.stack,
    }
    return NextResponse.json(diagnostics, { status: 500 })
  }
}
