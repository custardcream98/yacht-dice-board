'use client'

import { PlayCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsyncHandler } from '@/hooks/useAsyncHandler'
import { FirebaseCustomError } from '@/lib/firebase/error'
import { gameActions, isStartGameErrorCode, START_GAME_ERROR_CODES } from '@/lib/firebase/game'
import { GameRoom, Player } from '@/types/game'

interface WaitingRoomProps {
  gameRoom: GameRoom
  myPlayer: Player
}

const START_GAME_ERROR_MESSAGES = {
  [START_GAME_ERROR_CODES.ROOM_NOT_FOUND]: '존재하지 않는 방입니다.',
} as const

export function WaitingRoom({ gameRoom, myPlayer }: WaitingRoomProps) {
  const { handleAsync: startGame, isPending: isStartGamePending } = useAsyncHandler(gameActions.startGame)

  const handleStartGame = async () => {
    try {
      await startGame(gameRoom.id)
    } catch (err) {
      alert(
        err instanceof FirebaseCustomError && isStartGameErrorCode(err.code)
          ? START_GAME_ERROR_MESSAGES[err.code]
          : '게임 시작에 실패했습니다.',
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-center">
          <PlayCircle className="h-6 w-6" />
          게임 시작 준비
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 font-bold">참가자 ({gameRoom.players.length}명)</h3>
          <div className="space-y-2">
            {gameRoom.players.map((player, index) => (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3" key={player.id}>
                <span className="font-medium">
                  {player.name}
                  {player.id === myPlayer.id && ' (나)'}
                  {index === 0 && ' 👑'}
                </span>
                <Badge variant="outline">준비 완료</Badge>
              </div>
            ))}
          </div>
        </div>
        <Button className="h-12 w-full text-lg font-bold" disabled={isStartGamePending} onClick={handleStartGame}>
          <PlayCircle className="mr-2 h-5 w-5" />
          게임 시작하기
        </Button>
      </CardContent>
    </Card>
  )
}
