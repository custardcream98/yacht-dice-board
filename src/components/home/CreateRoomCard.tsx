'use client'

import { Plus, GamepadIcon, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { ExtendedRuleCheckboxes } from '@/components/game/ExtendedRuleCheckboxes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAsyncHandler } from '@/hooks/useAsyncHandler'
import { roomActions } from '@/lib/firebase/room'
import { cn } from '@/lib/utils'
import { ExtendedRules, DEFAULT_EXTENDED_RULES } from '@/types/game'

export function CreateRoomCard() {
  const router = useRouter()
  const { handleAsync: createRoom, isPending: isCreateRoomPending } = useAsyncHandler(roomActions.createRoom)

  const [roomName, setRoomName] = useState('')
  const trimmedRoomName = roomName.trim()
  const [extendedRules, setExtendedRules] = useState<ExtendedRules>(DEFAULT_EXTENDED_RULES)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const [isRouterPushPending, startTransition] = useTransition()

  const handleCreateRoom = async () => {
    if (!trimmedRoomName) {
      alert('방 이름을 입력해주세요.')
      return
    }

    try {
      const newRoomId = await createRoom({ roomName: trimmedRoomName, extendedRules })

      startTransition(() => {
        router.push(`/invite/${newRoomId}`)
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 생성에 실패했습니다.')
    }
  }

  const handleRuleChange = (rule: keyof ExtendedRules, value: boolean) =>
    setExtendedRules(prev => ({ ...prev, [rule]: value }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />새 게임 만들기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoomNameInput onRoomNameChange={setRoomName} roomName={roomName} />

        {/* 확장 룰 설정 */}
        <div>
          <Button
            className="w-full"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Settings className="mr-2 h-4 w-4" />
            {showAdvancedSettings ? '확장 룰 설정 접기' : '확장 룰 설정 펼치기'}
          </Button>

          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300',
              showAdvancedSettings ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
              <ExtendedRuleCheckboxes extendedRules={extendedRules} handleRuleChange={handleRuleChange} />
            </div>
          </div>
        </div>

        <Button
          className="h-12 w-full text-lg font-bold"
          disabled={isCreateRoomPending || isRouterPushPending || !trimmedRoomName}
          onClick={handleCreateRoom}
        >
          <GamepadIcon className="mr-2 h-5 w-5" />
          {isCreateRoomPending || isRouterPushPending ? '방 생성 중...' : '방 만들고 시작하기'}
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
      <label className="mb-2 block text-sm font-medium" htmlFor={id}>
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
