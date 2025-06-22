'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { GameRoom, Player } from '@/types/game'

interface GameStatusProps {
  gameRoom: GameRoom
  currentPlayer: Player
  isMyTurn: boolean
}

export function GameStatus({ gameRoom, currentPlayer, isMyTurn }: GameStatusProps) {
  if (gameRoom.status !== 'playing') {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="text-lg font-bold">
            라운드 {gameRoom.currentRound} / {gameRoom.maxRounds}
          </div>
          <div className="text-sm text-gray-600">
            현재 차례:{' '}
            <span className="font-bold text-blue-600">
              {currentPlayer?.name}
              {isMyTurn && ' (나)'}
            </span>
          </div>
          {!isMyTurn && (
            <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
              <Lock className="h-3 w-3 inline mr-1" />
              {currentPlayer?.name}님의 차례입니다
            </div>
          )}
          {isMyTurn && (
            <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
              ✨ 당신의 차례입니다!
            </div>
          )}
          {gameRoom.currentRound === 1 && (
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
              🎲 순서가 랜덤하게 섞였습니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
