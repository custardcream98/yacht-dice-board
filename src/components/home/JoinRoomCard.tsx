'use client'

import { useId, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users } from 'lucide-react'

interface JoinRoomCardProps {
  playerName: string
  inviteRoomId?: string
  onJoinRoom: (roomId: string) => Promise<void>
}

export function JoinRoomCard({ playerName, inviteRoomId, onJoinRoom }: JoinRoomCardProps) {
  const [joinRoomId, setJoinRoomId] = useState(inviteRoomId || '')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim() || !playerName.trim()) {
      alert('방 ID와 플레이어 이름을 모두 입력해주세요.')
      return
    }

    setIsJoining(true)
    try {
      await onJoinRoom(joinRoomId.trim())
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 참여에 실패했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {inviteRoomId ? '게임 참여하기' : '기존 게임 참여하기'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!inviteRoomId && <RoomIdInput joinRoomId={joinRoomId} onJoinRoomIdChange={setJoinRoomId} />}
        <Button
          onClick={handleJoinRoom}
          variant="outline"
          className="w-full h-12 text-lg font-bold"
          disabled={isJoining || !joinRoomId.trim() || !playerName.trim()}
        >
          <Users className="h-5 w-5 mr-2" />
          {isJoining ? '참여 중...' : '게임 참여하기'}
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
