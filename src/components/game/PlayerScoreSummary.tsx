'use client'

import { Trophy, Users, Crown } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { YachtDiceCalculator } from '@/lib/yacht-dice-rules'
import { Player, GameRoom } from '@/types/game'

interface PlayerScoreSummaryProps {
  gameRoom: GameRoom
  myPlayer: Player
}

export function PlayerScoreSummary({ gameRoom, myPlayer }: PlayerScoreSummaryProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(myPlayer.id)

  // 선택된 플레이어 찾기
  const selectedPlayer = gameRoom.players.find(p => p.id === selectedPlayerId) || myPlayer

  // 플레이어 순위 계산
  const getPlayerRankings = () => {
    return gameRoom.players
      .map(player => ({
        ...player,
        total: YachtDiceCalculator.calculateTotalScore(player.scores),
      }))
      .sort((a, b) => b.total - a.total)
  }

  const rankings = getPlayerRankings()
  const selectedPlayerRank = rankings.findIndex(p => p.id === selectedPlayer.id) + 1
  const currentPlayerIndex = gameRoom.currentPlayerIndex
  const currentPlayer = gameRoom.players[currentPlayerIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          플레이어 점수
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 플레이어 선택 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {gameRoom.players.map(player => {
            const isSelected = player.id === selectedPlayerId
            const isMe = player.id === myPlayer.id
            const isCurrentTurn = player.id === currentPlayer.id
            const playerRank = rankings.findIndex(p => p.id === player.id) + 1

            return (
              <Button
                className={`relative flex-shrink-0 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
              >
                <div className="flex items-center gap-2">
                  {/* 순위 표시 */}
                  {playerRank === 1 && <Crown className="h-3 w-3 text-yellow-500" />}
                  {playerRank > 1 && <span className="text-xs font-bold text-gray-500">#{playerRank}</span>}

                  {/* 플레이어 이름 */}
                  <span className="font-medium">
                    {player.name}
                    {isMe && ' (나)'}
                  </span>

                  {/* 현재 차례 표시 */}
                  {isCurrentTurn && <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />}
                </div>
              </Button>
            )
          })}
        </div>

        {/* 선택된 플레이어 정보 */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{selectedPlayer.name}</h3>
              {selectedPlayer.id === myPlayer.id && (
                <Badge className="text-xs" variant="outline">
                  나
                </Badge>
              )}
              {selectedPlayer.id === currentPlayer.id && <Badge className="bg-green-500 text-xs">현재 차례</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {selectedPlayerRank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className="text-sm font-medium text-gray-600">{selectedPlayerRank}등</span>
            </div>
          </div>

          {/* 점수 상세 */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm text-gray-600">상위 섹션</div>
              <div className="text-xl font-bold">
                {YachtDiceCalculator.calculateUpperSectionTotal(selectedPlayer.scores)}점
              </div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm text-gray-600">보너스</div>
              <div className="text-xl font-bold text-blue-600">
                {YachtDiceCalculator.calculateUpperBonus(selectedPlayer.scores)}점
              </div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm text-gray-600">하위 섹션</div>
              <div className="text-xl font-bold">
                {YachtDiceCalculator.calculateLowerSectionTotal(selectedPlayer.scores)}점
              </div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm text-gray-600">총점</div>
              <div className="text-2xl font-bold text-green-600">
                {YachtDiceCalculator.calculateTotalScore(selectedPlayer.scores)}점
              </div>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>진행률</span>
              <span>
                {Object.keys(selectedPlayer.scores).length} / {gameRoom.maxRounds} 라운드
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${(Object.keys(selectedPlayer.scores).length / gameRoom.maxRounds) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 빠른 순위 보기 */}
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">현재 순위</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {rankings.slice(0, 3).map((player, index) => (
              <div className="flex items-center justify-between" key={player.id}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className={`font-medium ${player.id === myPlayer.id ? 'text-blue-600' : ''}`}>
                    {player.name}
                    {player.id === myPlayer.id && ' (나)'}
                  </span>
                </div>
                <span className="font-mono text-xs">{player.total}점</span>
              </div>
            ))}
            {rankings.length > 3 && (
              <div className="mt-1 text-center text-xs text-gray-500">... 외 {rankings.length - 3}명</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
