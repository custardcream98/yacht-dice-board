'use client'

import { useId, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, GamepadIcon } from 'lucide-react'

interface CreateRoomCardProps {
  playerName: string
  onCreateRoom: (roomName: string) => Promise<void>
}

export function CreateRoomCard({ playerName, onCreateRoom }: CreateRoomCardProps) {
  const [roomName, setRoomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) {
      alert('방 이름과 플레이어 이름을 모두 입력해주세요.')
      return
    }

    setIsCreating(true)
    try {
      await onCreateRoom(roomName.trim())
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />새 게임 만들기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoomNameInput roomName={roomName} onRoomNameChange={setRoomName} />
        <Button
          onClick={handleCreateRoom}
          className="w-full h-12 text-lg font-bold"
          disabled={isCreating || !roomName.trim() || !playerName.trim()}
        >
          <GamepadIcon className="h-5 w-5 mr-2" />
          {isCreating ? '방 생성 중...' : '방 만들고 시작하기'}
        </Button>
      </CardContent>
    </Card>
  )
}

const RoomNameInput = ({
  roomName,
  onRoomNameChange,
}: {
  roomName: string
  onRoomNameChange: (value: string) => void
}) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        방 이름
      </label>
      <Input
        id={id}
        value={roomName}
        onChange={e => onRoomNameChange(e.currentTarget.value)}
        placeholder="방 이름을 입력하세요"
        maxLength={20}
      />
    </div>
  )
}
