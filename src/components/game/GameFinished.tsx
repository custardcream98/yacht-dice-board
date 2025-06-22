'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Trophy } from 'lucide-react'
import { GameRoom } from '@/types/game'

interface GameFinishedProps {
  gameRoom: GameRoom
}

export function GameFinished({ gameRoom }: GameFinishedProps) {
  if (gameRoom.status !== 'finished') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          게임 종료
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-lg mb-4">🎉 게임이 종료되었습니다! 🎉</p>
          <Button
            onClick={() => window.open(`/board/${gameRoom.id}`, '_blank')}
            className="w-full h-12 text-lg font-bold"
          >
            <Trophy className="h-5 w-5 mr-2" />
            전광판에서 결과 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
