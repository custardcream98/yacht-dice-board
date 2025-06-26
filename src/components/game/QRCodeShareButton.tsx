'use client'

import { QrCode, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface QRCodeShareButtonProps {
  className?: string
  roomId: string
}

export function QRCodeShareButton({ roomId, className }: QRCodeShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // 초대 링크 생성
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteUrl = `${baseUrl}/invite/${roomId}`

  // 클립보드에 링크 복사
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 API가 지원되지 않는 경우 폴백
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className={className} size="sm" variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          QR 코드
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <QrCode className="h-5 w-5" />
            QR 코드로 초대하기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR 코드 */}
          <div className="flex justify-center rounded-lg border bg-white p-4">
            <QRCodeSVG bgColor="#ffffff" fgColor="#000000" level="M" marginSize={0} size={200} value={inviteUrl} />
          </div>

          {/* 설명 텍스트 */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">스마트폰으로 QR 코드를 스캔하면</p>
            <p className="text-sm font-medium text-gray-800">게임에 바로 참여할 수 있어요!</p>
          </div>

          {/* 링크 표시 및 복사 */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">초대 링크:</div>
            <div className="flex gap-2">
              <div className="flex-1 rounded bg-gray-50 p-2 font-mono text-xs break-all">{inviteUrl}</div>
              <Button
                className="flex-shrink-0"
                onClick={copyToClipboard}
                size="sm"
                variant={copied ? 'secondary' : 'outline'}
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="pt-2">
            <Button className="w-full" onClick={() => setIsOpen(false)} variant="secondary">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
