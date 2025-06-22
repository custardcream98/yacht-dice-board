'use client'

import { Card, CardContent } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'

interface InviteNoticeProps {
  roomId: string
}

export function InviteNotice({ roomId }: InviteNoticeProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-800">게임 초대</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          방 ID <span className="font-mono font-bold">{roomId}</span>에 초대되었습니다.
          <br />
          플레이어 이름을 입력하고 참여하세요!
        </p>
      </CardContent>
    </Card>
  )
}
