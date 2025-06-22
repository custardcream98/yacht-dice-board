'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users } from 'lucide-react'
import { useId } from 'react'

interface PlayerNameInputProps {
  playerName: string
  onPlayerNameChange: (name: string) => void
}

export function PlayerNameInput({ playerName, onPlayerNameChange }: PlayerNameInputProps) {
  const id = useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          플레이어 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor={id} className="block text-sm font-medium mb-2">
            플레이어 이름
          </label>
          <Input
            id={id}
            value={playerName}
            onChange={e => onPlayerNameChange(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={10}
            className="text-center"
          />
          <p className="text-xs text-gray-500 mt-1">게임에서 사용할 이름을 입력하세요 (최대 10자)</p>
        </div>
      </CardContent>
    </Card>
  )
}
