'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { YachtDiceCalculator } from '@/lib/yacht-dice-rules'
import { Player } from '@/types/game'

interface PlayerScoreSummaryProps {
  player: Player
}

export function PlayerScoreSummary({ player }: PlayerScoreSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />내 점수 ({player.name})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">상위 섹션</div>
            <div className="text-xl font-bold">{YachtDiceCalculator.calculateUpperSectionTotal(player.scores)}점</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">보너스</div>
            <div className="text-xl font-bold text-blue-600">
              {YachtDiceCalculator.calculateUpperBonus(player.scores)}점
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">하위 섹션</div>
            <div className="text-xl font-bold">{YachtDiceCalculator.calculateLowerSectionTotal(player.scores)}점</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">총점</div>
            <div className="text-2xl font-bold text-green-600">
              {YachtDiceCalculator.calculateTotalScore(player.scores)}점
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
