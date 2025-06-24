'use client'

import { Plus, GamepadIcon, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGameRoomActions } from '@/hooks'
import { cn } from '@/lib/utils'
import { ExtendedRules, DEFAULT_EXTENDED_RULES } from '@/types/game'

export function CreateRoomCard() {
  const router = useRouter()
  const { createRoom } = useGameRoomActions()

  const [roomName, setRoomName] = useState('')
  const trimmedRoomName = roomName.trim()
  const [isCreating, setIsCreating] = useState(false)
  const [extendedRules, setExtendedRules] = useState<ExtendedRules>(DEFAULT_EXTENDED_RULES)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const [isRouterPushPending, startTransition] = useTransition()

  const handleCreateRoom = async () => {
    if (!trimmedRoomName) {
      alert('방 이름을 입력해주세요.')
      return
    }

    setIsCreating(true)
    try {
      const newRoomId = await createRoom({ roomName: trimmedRoomName, extendedRules })

      startTransition(() => {
        router.push(`/invite/${newRoomId}`)
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
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
            <Settings className="h-4 w-4 mr-2" />
            {showAdvancedSettings ? '확장 룰 설정 접기' : '확장 룰 설정 펼치기'}
          </Button>

          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300',
              showAdvancedSettings ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-3">
                <h4 className="font-medium text-sm text-gray-700">확장 룰 설정</h4>

                <div className="space-y-3">
                  <Label>
                    <Checkbox
                      checked={extendedRules.fullHouseFixedScore}
                      className="mt-0.5"
                      onCheckedChange={checked => handleRuleChange('fullHouseFixedScore', !!checked)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Full House 고정 점수</div>
                      <div className="text-xs text-gray-600">
                        Full House를 주사위 합계 대신 25점 고정으로 계산합니다.
                      </div>
                    </div>
                  </Label>

                  <Label>
                    <Checkbox
                      checked={extendedRules.enableThreeOfAKind}
                      className="mt-0.5"
                      onCheckedChange={checked => handleRuleChange('enableThreeOfAKind', !!checked)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">3 of a Kind 족보 추가</div>
                      <div className="text-xs text-gray-600">
                        같은 숫자 3개 이상일 때 주사위 합계로 점수를 얻는 족보를 추가합니다.
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

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
