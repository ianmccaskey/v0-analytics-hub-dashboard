"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface DiagnosticResult {
  timestamp: string
  environment_variables: {
    GA4_PROPERTY_ID: string
    GA4_CLIENT_EMAIL: string
    GA4_PRIVATE_KEY: string
  }
  authentication?: {
    status: string
  }
  api_test?: {
    status: string
    rows_returned?: number
    sample_data?: any[]
    error?: string
    details?: string
  }
}

export function ConnectionDiagnostic() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const runTest = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/ga/test-connection")
      const data = await response.json()
      setResult(data)
      setShowDetails(true)
    } catch (error) {
      console.error("[v0] Diagnostic test failed:", error)
    }
    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("✓") || status.includes("Success")) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (status.includes("❌") || status.includes("Failed")) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  return (
    <div className="rounded-[18px] border border-yellow-500/30 bg-yellow-500/5 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-[16px] font-medium text-foreground">GA4 Connection Status</h3>
          <p className="mb-4 text-[14px] text-muted-foreground">
            No data is loading from GA4. Click the button to run a diagnostic test.
          </p>

          <button
            onClick={runTest}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testing..." : "Test GA4 Connection"}
          </button>
        </div>
      </div>

      {result && showDetails && (
        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <div>
            <h4 className="mb-3 text-[15px] font-medium text-foreground">Environment Variables</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[14px]">
                {getStatusIcon(result.environment_variables.GA4_PROPERTY_ID)}
                <span className="text-muted-foreground">GA4_PROPERTY_ID:</span>
                <span className="font-mono text-foreground">{result.environment_variables.GA4_PROPERTY_ID}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px]">
                {getStatusIcon(result.environment_variables.GA4_CLIENT_EMAIL)}
                <span className="text-muted-foreground">GA4_CLIENT_EMAIL:</span>
                <span className="font-mono text-foreground">{result.environment_variables.GA4_CLIENT_EMAIL}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px]">
                {getStatusIcon(result.environment_variables.GA4_PRIVATE_KEY)}
                <span className="text-muted-foreground">GA4_PRIVATE_KEY:</span>
                <span className="font-mono text-foreground">{result.environment_variables.GA4_PRIVATE_KEY}</span>
              </div>
            </div>
          </div>

          {result.api_test && (
            <div>
              <h4 className="mb-3 text-[15px] font-medium text-foreground">API Connection Test</h4>
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="flex items-center gap-3 text-[14px]">
                  {getStatusIcon(result.api_test.status)}
                  <span className="font-medium text-foreground">{result.api_test.status}</span>
                </div>

                {result.api_test.rows_returned !== undefined && (
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Rows returned: {result.api_test.rows_returned}
                  </p>
                )}

                {result.api_test.error && (
                  <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-[13px] font-medium text-red-500">Error:</p>
                    <p className="mt-1 font-mono text-[12px] text-red-400">{result.api_test.error}</p>
                  </div>
                )}

                {result.api_test.sample_data && result.api_test.sample_data.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[13px] font-medium text-foreground">Sample Data:</p>
                    <pre className="overflow-auto rounded bg-background p-3 font-mono text-[11px] text-muted-foreground">
                      {JSON.stringify(result.api_test.sample_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <h4 className="mb-2 text-[14px] font-medium text-blue-300">Troubleshooting Tips:</h4>
            <ul className="space-y-1 text-[13px] text-blue-200/80">
              <li>• Verify the GA4 Property ID matches your Google Analytics property</li>
              <li>• Ensure the service account email has "Viewer" access in GA4 Property Settings</li>
              <li>• Check that the private key is properly formatted with newline characters</li>
              <li>• It may take 24-48 hours for new GA4 properties to start collecting data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
