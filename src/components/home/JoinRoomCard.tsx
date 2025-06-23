'use client'

import { Users } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
        <Button asChild className="w-full h-12 text-lg font-bold" disabled={!roomId} variant="outline">
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
      <label className="block text-sm font-medium mb-2" htmlFor={id}>
        방 ID
      </label>
      <Input
        className="font-mono"
        id={id}
        onChange={e => onJoinRoomIdChange(e.target.value)}
        placeholder="방 ID를 입력하세요 "
        value={joinRoomId}
      />
    </div>
  )
}
