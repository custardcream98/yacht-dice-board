'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Copy, Check } from 'lucide-react'

interface QRCodeShareButtonProps {
  roomId: string
  className?: string
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <QrCode className="h-4 w-4 mr-2" />
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
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCodeSVG value={inviteUrl} size={200} level="M" marginSize={0} bgColor="#ffffff" fgColor="#000000" />
          </div>

          {/* 설명 텍스트 */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">스마트폰으로 QR 코드를 스캔하면</p>
            <p className="text-sm font-medium text-gray-800">게임에 바로 참여할 수 있어요!</p>
          </div>

          {/* 링크 표시 및 복사 */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">초대 링크:</div>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-gray-50 rounded text-xs font-mono break-all">{inviteUrl}</div>
              <Button
                onClick={copyToClipboard}
                variant={copied ? 'secondary' : 'outline'}
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="pt-2">
            <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-full">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
