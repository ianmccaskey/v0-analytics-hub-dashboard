'use client'

import { useState } from 'react'
import { X, FileDown, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Contact {
  name: string
  email: string
  owner: string
  clicks?: number
}

interface ExportModalProps {
  clickers: Contact[]
  onClose: () => void
}

export function ExportModal({ clickers, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  // Group contacts by owner
  const ownerGroups = clickers.reduce((acc, contact) => {
    if (!acc[contact.owner]) {
      acc[contact.owner] = []
    }
    acc[contact.owner].push(contact)
    return acc
  }, {} as Record<string, Contact[]>)

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsExporting(false)
    setExportComplete(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-[18px] border border-border bg-card p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {!exportComplete ? (
          <>
            <h2 className="mb-2 text-[22px] font-semibold text-foreground">
              Export CSV by Owner
            </h2>
            <p className="mb-6 text-[15px] text-[rgba(255,255,255,0.65)]">
              The system will generate separate CSV files grouped by customer account owner
              for all clickers in the selected email blast.
            </p>

            <div className="mb-8 space-y-2 rounded-lg border border-border bg-muted p-4">
              {Object.entries(ownerGroups).map(([owner, contacts]) => (
                <div
                  key={owner}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileDown className="h-5 w-5 text-primary" />
                    <span className="text-[15px] font-medium text-foreground">
                      {owner}
                    </span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    {contacts.length} contacts
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-border bg-transparent text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-primary text-primary-foreground shadow-[0_0_18px_rgba(24,242,196,0.35)] transition-all hover:shadow-[0_0_24px_rgba(24,242,196,0.55)]"
              >
                {isExporting ? 'Generating...' : 'Generate Exports'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h2 className="text-[22px] font-semibold text-foreground">
                Exports Generated
              </h2>
            </div>
            
            <p className="mb-6 text-[15px] text-[rgba(255,255,255,0.65)]">
              Your CSV exports have been generated successfully:
            </p>

            <div className="mb-8 space-y-2 rounded-lg border border-border bg-muted p-4">
              {Object.keys(ownerGroups).map((owner) => {
                const fileName = `broadcast_123_owner_${owner.toLowerCase().replace(/\s+/g, '_')}.csv`
                return (
                  <div
                    key={owner}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <FileDown className="h-5 w-5 text-primary" />
                    <span className="font-mono text-[13px] text-foreground">
                      {fileName}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={onClose}
                className="bg-primary text-primary-foreground shadow-[0_0_18px_rgba(24,242,196,0.35)]"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
