'use client'

import { useId, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users } from 'lucide-react'
import Link from 'next/link'

export function JoinRoomCard() {
  const [joinRoomId, setJoinRoomId] = useState('')
  const roomId = joinRoomId.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          기존 게임 참여하기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoomIdInput joinRoomId={joinRoomId} onJoinRoomIdChange={setJoinRoomId} />
        <Button variant="outline" className="w-full h-12 text-lg font-bold" disabled={!roomId} asChild>
          <Link href={`/invite/${roomId}`}>
            <Users className="h-5 w-5 mr-2" />
            게임 참여하기
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const RoomIdInput = ({
  joinRoomId,
  onJoinRoomIdChange,
}: {
  joinRoomId: string
  onJoinRoomIdChange: (value: string) => void
}) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        방 ID
      </label>
      <Input
        id={id}
        value={joinRoomId}
        onChange={e => onJoinRoomIdChange(e.target.value)}
        placeholder="방 ID를 입력하세요 "
        className="font-mono"
      />
    </div>
  )
}
