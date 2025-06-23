'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LinkShareButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  url: string
}

export function LinkShareButton({ url, label, icon: Icon }: LinkShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 API가 지원되지 않는 경우 폴백
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex gap-2">
        <Input className="text-xs font-mono" onClick={e => e.currentTarget.select()} readOnly value={url} />
        <Button
          className="flex-shrink-0"
          onClick={copyToClipboard}
          size="sm"
          variant={copied ? 'secondary' : 'outline'}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              복사
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
