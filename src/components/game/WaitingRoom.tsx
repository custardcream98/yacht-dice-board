'use client'

import { PlayCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameRoom, Player } from '@/types/game'

interface WaitingRoomProps {
  gameRoom: GameRoom
  myPlayer: Player
  onStartGame: () => void
}

export function WaitingRoom({ gameRoom, myPlayer, onStartGame }: WaitingRoomProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <PlayCircle className="h-6 w-6" />
          게임 시작 준비
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold mb-2">참가자 ({gameRoom.players.length}명)</h3>
          <div className="space-y-2">
            {gameRoom.players.map((player, index) => (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" key={player.id}>
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
        <Button className="w-full h-12 text-lg font-bold" onClick={onStartGame}>
          <PlayCircle className="h-5 w-5 mr-2" />
          게임 시작하기
        </Button>
      </CardContent>
    </Card>
  )
}
