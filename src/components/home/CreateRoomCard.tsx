'use client'

import { Plus, GamepadIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGameRoomActions } from '@/hooks'

export function CreateRoomCard() {
  const router = useRouter()
  const { createRoom } = useGameRoomActions()

  const [roomName, setRoomName] = useState('')
  const trimmedRoomName = roomName.trim()
  const [isCreating, setIsCreating] = useState(false)

  const [isRouterPushPending, startTransition] = useTransition()

  const handleCreateRoom = async () => {
    if (!trimmedRoomName) {
      alert('방 이름을 입력해주세요.')
      return
    }

    setIsCreating(true)
    try {
      const newRoomId = await createRoom(trimmedRoomName)

      startTransition(() => {
        router.push(`/invite/${newRoomId}`)
      })
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
        <RoomNameInput onRoomNameChange={setRoomName} roomName={roomName} />
        <Button
          className="w-full h-12 text-lg font-bold"
          disabled={isCreating || isRouterPushPending || !trimmedRoomName}
          onClick={handleCreateRoom}
        >
          <GamepadIcon className="h-5 w-5 mr-2" />
          {isCreating || isRouterPushPending ? '방 생성 중...' : '방 만들고 시작하기'}
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
      <label className="block text-sm font-medium mb-2" htmlFor={id}>
        방 이름
      </label>
      <Input
        id={id}
        maxLength={20}
        onChange={e => onRoomNameChange(e.currentTarget.value)}
        placeholder="방 이름을 입력하세요"
        value={roomName}
      />
    </div>
  )
}
