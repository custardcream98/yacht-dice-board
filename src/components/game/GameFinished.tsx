import { Crown, Trophy, Medal, Target, TrendingUp, RotateCcw, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { ExtendedRuleCheckboxes } from '@/components/game/ExtendedRuleCheckboxes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getPlayerRankings, YachtDiceCalculator } from '@/lib/yacht-dice-rules'
import { ExtendedRules, GameRoom, Player } from '@/types/game'

interface GameFinishedProps {
  gameRoom: GameRoom
  myPlayer: Player
  onRestartGame: ({ extendedRules }: { extendedRules: ExtendedRules }) => Promise<void>
}

export function GameFinished({ gameRoom, myPlayer, onRestartGame }: GameFinishedProps) {
  const rankings = getPlayerRankings(gameRoom)
  const myRankingData = rankings.find(p => p.player.name === myPlayer.name)
  const myRanking = myRankingData?.ranking || 0
  const upperSectionTotal = YachtDiceCalculator.calculateUpperSectionTotal(myPlayer.scores)
  const lowerSectionTotal = YachtDiceCalculator.calculateLowerSectionTotal(myPlayer.scores)
  const bonus = YachtDiceCalculator.calculateUpperBonus(myPlayer.scores)
  const myTotalScore = upperSectionTotal + lowerSectionTotal + bonus
  const winners = rankings.filter(p => p.ranking === 1) // 동점 1등 처리

  // 순위에 따른 메시지와 아이콘
  const getRankingDisplay = () => {
    if (myRanking === 1) {
      return {
        icon: <Crown className="h-8 w-8 text-yellow-500" />,
        emoji: '🥇',
        title: '우승!',
        message: '축하합니다! 1등을 차지하셨습니다!',
        bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
      }
    } else if (myRanking === 2) {
      return {
        icon: <Medal className="h-8 w-8 text-gray-500" />,
        emoji: '🥈',
        title: '2등!',
        message: '훌륭합니다! 2등을 차지하셨습니다!',
        bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
      }
    } else if (myRanking === 3) {
      return {
        icon: <Medal className="h-8 w-8 text-orange-500" />,
        emoji: '🥉',
        title: '3등!',
        message: '좋습니다! 3등을 차지하셨습니다!',
        bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
      }
    } else {
      return {
        icon: <Target className="h-8 w-8 text-blue-500" />,
        emoji: '🎯',
        title: `${myRanking}등`,
        message: '수고하셨습니다! 다음 게임에서 더 좋은 결과를 기대해보세요!',
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
      }
    }
  }

  const rankingDisplay = getRankingDisplay()

  return (
    <div className="space-y-4">
      {/* 내 최종 결과 */}
      {rankingDisplay && (
        <Card className={`${rankingDisplay.bgColor} ${rankingDisplay.borderColor} border-2`}>
          <CardHeader>
            <CardTitle className={`text-center flex items-center justify-center gap-3 ${rankingDisplay.textColor}`}>
              {rankingDisplay.icon}
              <div>
                <div className="text-3xl mb-1">{rankingDisplay.emoji}</div>
                <div className="text-xl font-bold">{rankingDisplay.title}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className={`text-lg mb-4 ${rankingDisplay.textColor}`}>{rankingDisplay.message}</p>

              {/* 내 최종 점수 */}
              <div className="bg-white/70 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">내 최종 점수</div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{myTotalScore}점</div>
                <div className="text-sm text-gray-600">
                  {gameRoom.players.length}명 중 {myRanking}등
                  {rankings.filter(p => p.ranking === myRanking).length > 1 &&
                    ` (공동 ${rankings.filter(p => p.ranking === myRanking).length}명)`}
                </div>
              </div>

              {/* 점수 상세 분석 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-gray-600">상위 섹션</div>
                  <div className="text-lg font-bold">{upperSectionTotal}점</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-gray-600">보너스</div>
                  <div className="text-lg font-bold text-blue-600">{bonus}점</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-gray-600">하위 섹션</div>
                  <div className="text-lg font-bold">{lowerSectionTotal}점</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-gray-600">총합</div>
                  <div className="text-lg font-bold text-green-600">{myTotalScore}점</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 게임 종료 정보 및 전광판 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            게임 종료
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {/* 우승자 정보 */}
            {winners.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-lg mb-2">
                  🏆 {winners.length > 1 ? `공동 우승자 (${winners.length}명)` : '우승자'}
                </div>
                {winners.length === 1 ? (
                  <>
                    <div className="font-bold text-xl text-yellow-800">{winners[0].player.name}</div>
                    <div className="text-lg font-mono text-yellow-700">{winners[0].totalScore}점</div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {winners.map(winner => (
                      <div className="flex justify-between items-center" key={winner.player.name}>
                        <div className="font-bold text-lg text-yellow-800">{winner.player.name}</div>
                        <div className="text-lg font-mono text-yellow-700">{winner.totalScore}점</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full h-12 text-lg font-bold">
                <Link href={`/board/${gameRoom.id}`}>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  전광판에서 전체 결과 보기
                </Link>
              </Button>
              <RestartGameDialog onRestartGame={onRestartGame} prevExtendedRules={gameRoom.extendedRules} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const RestartGameDialog = ({
  prevExtendedRules,
  onRestartGame,
}: {
  prevExtendedRules: ExtendedRules
  onRestartGame: ({ extendedRules }: { extendedRules: ExtendedRules }) => Promise<void>
}) => {
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [extendedRules, setExtendedRules] = useState<ExtendedRules>(prevExtendedRules)

  const [isRestarting, setIsRestarting] = useState(false)
  const handleRestartGame = async () => {
    setIsRestarting(true)
    await onRestartGame({ extendedRules })
    setIsRestartDialogOpen(false)
    setIsRestarting(false)
  }

  return (
    <Dialog onOpenChange={setIsRestartDialogOpen} open={isRestartDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 text-lg font-bold" variant="outline">
          <RotateCcw className="h-5 w-5 mr-2" />새 게임 시작하기
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            게임 재시작 확인
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg mb-2">정말로 새 게임을 시작하시겠습니까?</p>
          <p className="text-sm text-gray-600 mb-4">
            현재 게임의 모든 점수가 초기화되고, 새로운 순서로 게임이 시작됩니다.
          </p>
          <ExtendedRuleCheckboxes
            extendedRules={extendedRules}
            handleRuleChange={(rule, value) => setExtendedRules(prev => ({ ...prev, [rule]: value }))}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={isRestarting}
              onClick={() => setIsRestartDialogOpen(false)}
              variant="outline"
            >
              취소
            </Button>
            <Button className="flex-1" disabled={isRestarting} onClick={handleRestartGame}>
              <RotateCcw className="h-4 w-4 mr-2" />새 게임 시작
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
