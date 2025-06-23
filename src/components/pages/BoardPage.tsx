'use client'

import { Trophy, Users, Crown, Maximize, Minimize } from 'lucide-react'
import { useState, useEffect } from 'react'

import { QRCodeShareButton } from '@/components/game'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SCORE_CATEGORIES, UPPER_SECTION_CATEGORIES } from '@/constants/game'
import { useGameRoomData } from '@/hooks'
import { cn } from '@/lib/utils'
import { YachtDiceCalculator, CATEGORY_NAMES } from '@/lib/yacht-dice-rules'
import { Player } from '@/types/game'

export default function GameBoardPage({ roomId }: { roomId: string }) {
  const { gameRoom } = useGameRoomData(roomId)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 전체화면 상태 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 전체화면 토글
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // noop
    }
  }

  // 총점 계산
  const calculatePlayerTotal = (player: Player): number => {
    return YachtDiceCalculator.calculateTotalScore(player.scores)
  }

  // 상위 섹션 총점 계산
  const calculateUpperSectionTotal = (player: Player): number => {
    return YachtDiceCalculator.calculateUpperSectionTotal(player.scores)
  }

  // 보너스 점수 계산
  const calculateUpperBonus = (player: Player): number => {
    return YachtDiceCalculator.calculateUpperBonus(player.scores)
  }

  const rankings = gameRoom.players
    .map(player => ({
      ...player,
      total: calculatePlayerTotal(player),
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 relative">
      {/* 상단 버튼들 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* QR 코드 공유 버튼 */}
        {gameRoom.status === 'waiting' && (
          <QRCodeShareButton className="bg-white/20 hover:bg-white/30 text-white border-white/30" roomId={roomId} />
        )}

        {/* 전체화면 토글 버튼 */}
        <Button
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          onClick={toggleFullscreen}
          size="sm"
          variant="outline"
        >
          {isFullscreen ? (
            <>
              <Minimize className="h-4 w-4 mr-2" />
              전체화면 해제
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4 mr-2" />
              전체화면
            </>
          )}
        </Button>
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className={cn('text-center', isFullscreen ? 'mb-4' : 'mb-6')}>
          <div className={cn('flex items-center justify-center gap-3', isFullscreen ? 'mb-2' : 'mb-3')}>
            <Trophy className={cn('text-yellow-400', isFullscreen ? 'h-8 w-8' : 'h-8 w-8')} />
            <h1 className={cn('font-bold text-white', isFullscreen ? 'text-4xl' : 'text-3xl')}>
              {gameRoom.name} 점수판
            </h1>
          </div>
          <div className="flex items-center justify-center gap-6 text-white text-sm">
            <div className="flex items-center gap-2">
              <Badge className="px-3 py-1" variant={gameRoom.status === 'playing' ? 'default' : 'secondary'}>
                {gameRoom.status === 'waiting' && '대기 중'}
                {gameRoom.status === 'playing' && '게임 진행 중'}
                {gameRoom.status === 'finished' && '게임 종료'}
              </Badge>
            </div>

            {gameRoom.status === 'playing' && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">현재 차례: {gameRoom.players[gameRoom.currentPlayerIndex]?.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    라운드 {gameRoom.currentRound} / {gameRoom.maxRounds}
                  </div>
                  {gameRoom.currentRound === 1 && (
                    <div className="text-xs text-blue-200 bg-blue-800/30 px-2 py-1 rounded">
                      🎲 순서가 랜덤하게 섞였습니다
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 게임 종료 시 순위 표시 */}
        {gameRoom.status === 'finished' && (
          <Card
            className={cn(
              `bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200`,
              isFullscreen ? 'mb-4' : 'mb-6',
            )}
          >
            <CardHeader className={isFullscreen ? 'pb-2' : 'pb-3'}>
              <CardTitle
                className={cn(
                  `text-center text-yellow-800 flex items-center justify-center gap-2`,
                  isFullscreen ? 'text-2xl' : 'text-xl',
                )}
              >
                <Crown className={isFullscreen ? 'h-7 w-7' : 'h-6 w-6'} />
                🎉 게임 결과 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`grid grid-cols-1 md:grid-cols-3 ${isFullscreen ? 'gap-3' : 'gap-3'}`}>
                {rankings.slice(0, 3).map((player, index) => (
                  <div
                    className={cn(
                      `text-center rounded-lg`,
                      isFullscreen ? 'p-4' : 'p-3',
                      index === 0
                        ? 'bg-yellow-100 border-2 border-yellow-300'
                        : index === 1
                          ? 'bg-gray-100 border-2 border-gray-300'
                          : 'bg-orange-100 border-2 border-orange-300',
                    )}
                    key={player.id}
                  >
                    <div className={isFullscreen ? 'text-3xl mb-2' : 'text-2xl mb-1'}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={cn(`font-bold`, isFullscreen ? 'text-lg' : 'text-base')}>{player.name}</div>
                    <div className={cn(`font-mono font-bold text-gray-800`, isFullscreen ? 'text-2xl' : 'text-xl')}>
                      {player.total}점
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 점수판 */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table className={isFullscreen ? 'text-base' : 'text-sm'}>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead />
                    {gameRoom.players.map(player => (
                      <TableHead className={`text-center ${isFullscreen ? 'min-w-32' : 'min-w-24'}`} key={player.id}>
                        <div className="space-y-1">
                          <div className={`font-bold ${isFullscreen ? 'text-lg' : 'text-base'}`}>{player.name}</div>
                          {gameRoom.status === 'playing' &&
                            gameRoom.players[gameRoom.currentPlayerIndex]?.id === player.id && (
                              <Badge className="bg-green-500 text-white text-xs animate-pulse">현재 차례</Badge>
                            )}
                          {gameRoom.status === 'finished' && rankings[0]?.id === player.id && (
                            <Badge className="bg-yellow-500 text-white text-xs">🏆 우승</Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 상위 섹션 */}
                  {UPPER_SECTION_CATEGORIES.map(category => (
                    <TableRow className="hover:bg-gray-50" key={category}>
                      <TableCell className={`font-bold ${isFullscreen ? 'text-base py-2' : 'text-sm py-2'}`}>
                        {CATEGORY_NAMES[category]}
                      </TableCell>
                      {gameRoom.players.map(player => (
                        <TableCell className={`text-center ${isFullscreen ? 'py-2' : 'py-2'}`} key={player.id}>
                          <div className={`font-mono font-bold ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
                            {player.scores[category] !== undefined ? player.scores[category] : '-'}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* 상위 섹션 보너스 */}
                  <TableRow className="bg-green-50">
                    <TableCell className={cn('font-bold', isFullscreen ? 'text-base py-2' : 'text-sm py-2')}>
                      상위 섹션 총점
                    </TableCell>
                    {gameRoom.players.map(player => (
                      <TableCell className="text-center py-2" key={player.id}>
                        <div className={cn('font-mono font-bold', isFullscreen ? 'text-xl' : 'text-lg')}>
                          {calculateUpperSectionTotal(player)}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-blue-100">
                    <TableCell
                      className={cn(`font-bold text-blue-800`, isFullscreen ? 'text-base py-2' : 'text-sm py-2')}
                    >
                      보너스
                    </TableCell>
                    {gameRoom.players.map(player => (
                      <TableCell className="text-center" key={player.id}>
                        <div className={cn(`font-mono font-bold text-blue-600`, isFullscreen ? 'text-xl' : 'text-lg')}>
                          {calculateUpperBonus(player)}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 하위 섹션 */}
                  {SCORE_CATEGORIES.slice(6).map(category => (
                    <TableRow className="hover:bg-gray-50" key={category}>
                      <TableCell className={cn(`font-bold`, isFullscreen ? 'text-base py-2' : 'text-sm py-2')}>
                        {CATEGORY_NAMES[category]}
                      </TableCell>
                      {gameRoom.players.map(player => (
                        <TableCell className="text-center" key={player.id}>
                          <div className={cn(`font-mono font-bold`, isFullscreen ? 'text-xl' : 'text-lg')}>
                            {player.scores[category] !== undefined ? player.scores[category] : '-'}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* 총점 */}
                  <TableRow className="bg-yellow-100 border-t-4 border-yellow-400">
                    <TableCell
                      className={cn(`font-bold text-yellow-800`, isFullscreen ? 'text-xl py-3' : 'text-lg py-3')}
                    >
                      총점
                    </TableCell>
                    {gameRoom.players.map(player => (
                      <TableCell className="text-center" key={player.id}>
                        <div
                          className={cn(`font-mono font-bold text-yellow-700`, isFullscreen ? 'text-3xl' : 'text-2xl')}
                        >
                          {calculatePlayerTotal(player)}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 하단 정보 - 전체화면에서는 숨김 */}
        {!isFullscreen && (
          <div className="text-center mt-4 text-white">
            <p className="text-sm opacity-75">
              방 ID: <span className="font-mono font-bold">{gameRoom.id}</span>
            </p>
            <p className="text-xs opacity-60 mt-1">실시간으로 업데이트되는 Yacht Dice 전광판</p>
          </div>
        )}
      </div>
    </div>
  )
}
