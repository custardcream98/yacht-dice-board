'use client'

import { ArrowLeft, Crown, Maximize, Minimize } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { QRCodeShareButton } from '@/components/game'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UPPER_SECTION_CATEGORIES, LOWER_SECTION_CATEGORIES } from '@/constants/game'
import { useGameRoomData } from '@/hooks'
import { cn } from '@/lib/utils'
import { YachtDiceCalculator, CATEGORY_NAMES, getPlayerRankings } from '@/lib/yacht-dice-rules'
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

  const visibleLowerCategories = LOWER_SECTION_CATEGORIES.filter(category => {
    if (category === 'threeOfAKind') {
      return gameRoom.extendedRules?.enableThreeOfAKind
    }
    return true
  })
  const rankings = getPlayerRankings(gameRoom)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-900 p-4">
      {/* 배경 장식 요소 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 blur-3xl"></div>
      </div>

      {/* 상단 버튼들 */}
      <div className="fixed top-6 right-4 left-4 z-50 flex gap-3">
        <Button
          asChild
          className="mr-auto border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-xl"
          size="sm"
          variant="outline"
        >
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />홈
          </Link>
        </Button>

        {/* QR 코드 공유 버튼 */}
        {gameRoom.status === 'waiting' && (
          <QRCodeShareButton
            className="border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-xl"
            roomId={roomId}
          />
        )}

        {/* 전체화면 토글 버튼 */}
        <Button
          className="border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:shadow-xl"
          onClick={toggleFullscreen}
          size="sm"
          variant="outline"
        >
          {isFullscreen ? (
            <>
              <Minimize className="mr-2 h-4 w-4" />
              전체화면 해제
            </>
          ) : (
            <>
              <Maximize className="mr-2 h-4 w-4" />
              전체화면
            </>
          )}
        </Button>
      </div>

      <div className="relative z-10 container mx-auto flex max-w-7xl flex-1 flex-col">
        {/* 헤더 */}
        <div className={cn('text-center', !isFullscreen && 'mb-8')}>
          <div className={cn('flex items-center justify-center gap-3', isFullscreen ? 'mb-1' : 'mb-4')}>
            <h1 className={cn('font-bold text-white', isFullscreen ? 'text-2xl' : 'text-5xl')}>{gameRoom.name}</h1>
          </div>

          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-2 text-white/90',
              isFullscreen ? 'text-xs' : 'text-sm',
            )}
          >
            <div className="flex items-center gap-1">
              <Badge
                className={cn(
                  'border-0 font-medium shadow-lg backdrop-blur-sm',
                  isFullscreen ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm',
                  gameRoom.status === 'playing'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : gameRoom.status === 'finished'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
                )}
              >
                {gameRoom.status === 'waiting' && '🎯 대기 중'}
                {gameRoom.status === 'playing' && '🎮 게임 진행 중'}
                {gameRoom.status === 'finished' && '🏆 게임 종료'}
              </Badge>
            </div>

            {gameRoom.status === 'playing' && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'rounded-full bg-white/10 font-medium backdrop-blur-sm',
                    isFullscreen ? 'px-2 py-1' : 'px-4 py-2',
                  )}
                >
                  라운드 <span className="font-bold text-cyan-300">{gameRoom.currentRound}</span>/{gameRoom.maxRounds}
                </div>
                {gameRoom.currentRound === 1 && !isFullscreen && (
                  <div className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-2 text-xs text-blue-200 backdrop-blur-sm">
                    🎲 순서가 랜덤하게 섞였습니다
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 게임 종료 시 순위 표시 */}
        {gameRoom.status === 'finished' && (
          <Card
            className={cn(
              `border-2 border-yellow-300/50 bg-gradient-to-br from-yellow-50/90 via-amber-50/90 to-orange-50/90 shadow-2xl backdrop-blur-sm`,
              isFullscreen ? 'mb-2' : 'mb-8',
            )}
          >
            <CardHeader className={isFullscreen ? 'pt-2 pb-1' : 'pb-4'}>
              <CardTitle
                className={cn(
                  `flex flex-col items-center justify-center text-center`,
                  isFullscreen ? 'gap-1 text-lg' : 'gap-3 text-3xl',
                )}
              >
                <div className={cn('flex items-center', isFullscreen ? 'gap-2' : 'gap-3')}>
                  <div className="relative">
                    <Crown className={cn('text-yellow-500 drop-shadow-lg', isFullscreen ? 'h-5 w-5' : 'h-10 w-10')} />
                    <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-lg"></div>
                  </div>
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text font-bold text-transparent">
                    🎉 게임 결과 🎉
                  </span>
                  <div className="relative">
                    <Crown className={cn('text-yellow-500 drop-shadow-lg', isFullscreen ? 'h-5 w-5' : 'h-10 w-10')} />
                    <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-lg"></div>
                  </div>
                </div>
                {rankings.filter(r => r.ranking === 1).length > 1 && (
                  <span
                    className={cn(
                      'rounded-full bg-amber-100/50 px-3 py-1 font-normal text-amber-700',
                      isFullscreen ? 'text-sm' : 'text-lg',
                    )}
                  >
                    공동우승 {rankings.filter(r => r.ranking === 1).length}명 🏆
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className={isFullscreen ? 'pt-0 pb-2' : 'pt-0'}>
              <div className={`grid grid-cols-1 md:grid-cols-3 ${isFullscreen ? 'gap-2' : 'gap-6'}`}>
                {rankings
                  .filter(p => p.ranking <= 3)
                  .map(rankingData => (
                    <div
                      className={cn(
                        `rounded-2xl border-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl`,
                        isFullscreen ? 'p-2' : 'p-6',
                        rankingData.ranking === 1
                          ? 'border-yellow-400/60 bg-gradient-to-br from-yellow-100/80 to-amber-100/80'
                          : rankingData.ranking === 2
                            ? 'border-gray-400/60 bg-gradient-to-br from-gray-100/80 to-slate-100/80'
                            : 'border-orange-400/60 bg-gradient-to-br from-orange-100/80 to-red-100/80',
                      )}
                      key={rankingData.player.id}
                    >
                      <div className={cn('relative', isFullscreen ? 'mb-1 text-2xl' : 'mb-3 text-5xl')}>
                        {rankingData.ranking === 1 ? '🥇' : rankingData.ranking === 2 ? '🥈' : '🥉'}
                        <div className="absolute inset-0 opacity-50 blur-sm">
                          {rankingData.ranking === 1 ? '🥇' : rankingData.ranking === 2 ? '🥈' : '🥉'}
                        </div>
                      </div>
                      <div className={cn(`font-bold`, isFullscreen ? 'mb-1 text-sm' : 'mb-2 text-xl')}>
                        {rankingData.player.name}
                        {rankings.filter(p => p.ranking === rankingData.ranking).length > 1 && (
                          <div
                            className={cn(
                              'mt-1 rounded-full bg-white/50 px-2 py-1 text-gray-600',
                              isFullscreen ? 'text-xs' : 'text-sm',
                            )}
                          >
                            공동 {rankingData.ranking}등
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          `font-mono font-bold`,
                          isFullscreen ? 'text-lg' : 'text-3xl',
                          rankingData.ranking === 1
                            ? 'text-yellow-700'
                            : rankingData.ranking === 2
                              ? 'text-gray-700'
                              : 'text-orange-700',
                        )}
                      >
                        {rankingData.totalScore}점
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 점수판 */}
        <div className="mt-auto mb-auto overflow-x-auto rounded-2xl border-2 border-white/20 bg-white shadow-2xl">
          <Table className={isFullscreen ? 'text-base' : 'text-sm'}>
            <TableHeader>
              <TableRow className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-100/80 to-gray-100/80 backdrop-blur-sm">
                <TableHead className="font-bold text-slate-700" />
                {gameRoom.players.map(player => (
                  <TableHead className={`text-center ${isFullscreen ? 'min-w-32' : 'min-w-24'}`} key={player.id}>
                    <div className={cn('space-y-1', isFullscreen ? 'py-1' : 'py-2')}>
                      <div className={cn('font-bold text-slate-800', isFullscreen ? 'text-sm' : 'text-base')}>
                        {player.name}
                      </div>
                      {gameRoom.status === 'playing' &&
                        gameRoom.players[gameRoom.currentPlayerIndex]?.id === player.id && (
                          <Badge
                            className={cn(
                              'animate-pulse bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
                              isFullscreen ? 'px-1 text-xs' : 'text-xs',
                            )}
                          >
                            🎯 현재 차례
                          </Badge>
                        )}
                      {gameRoom.status === 'finished' &&
                        rankings.some(r => r.ranking === 1 && r.player.id === player.id) && (
                          <Badge
                            className={cn(
                              'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg',
                              isFullscreen ? 'px-1 text-xs' : 'text-xs',
                            )}
                          >
                            🏆 {rankings.filter(r => r.ranking === 1).length > 1 ? '공동우승' : '우승'}
                          </Badge>
                        )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 상위 섹션 */}
              {UPPER_SECTION_CATEGORIES.map(category => (
                <TableRow
                  className="border-b border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50"
                  key={category}
                >
                  <TableCell
                    className={cn(
                      `bg-gradient-to-r from-slate-50 to-gray-50 pl-4 font-bold text-slate-700`,
                      isFullscreen ? 'py-2 text-base' : 'py-3 text-sm',
                    )}
                  >
                    <div className="flex items-center gap-2">{CATEGORY_NAMES[category]}</div>
                  </TableCell>
                  {gameRoom.players.map(player => (
                    <TableCell
                      className={cn(`text-center transition-all duration-200`, isFullscreen ? 'py-2' : 'py-3')}
                      key={player.id}
                    >
                      <div
                        className={cn(
                          `font-mono font-bold transition-all duration-200`,
                          isFullscreen ? 'text-xl' : 'text-lg',
                          player.scores[category] !== undefined ? 'text-slate-800' : 'text-slate-400',
                        )}
                      >
                        {player.scores[category] !== undefined ? player.scores[category] : '—'}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* 상위 섹션 보너스 */}
              <TableRow className="border-y-2 border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-green-50/80">
                <TableCell className="py-2 pl-4 text-sm font-bold text-emerald-800">상위 섹션 총점</TableCell>
                {gameRoom.players.map(player => (
                  <TableCell className="py-2 text-center font-mono text-lg font-bold text-emerald-700" key={player.id}>
                    {calculateUpperSectionTotal(player)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                <TableCell
                  className={cn(`pl-4 font-bold text-blue-800`, isFullscreen ? 'py-2 text-base' : 'py-3 text-sm')}
                >
                  보너스
                </TableCell>
                {gameRoom.players.map(player => (
                  <TableCell className={cn('text-center', isFullscreen ? 'py-2' : 'py-3')} key={player.id}>
                    <div
                      className={cn(
                        `font-mono font-bold`,
                        isFullscreen ? 'text-xl' : 'text-lg',
                        calculateUpperBonus(player) > 0 ? 'text-blue-700' : 'text-slate-400',
                      )}
                    >
                      {calculateUpperBonus(player)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* 하위 섹션 */}
              {visibleLowerCategories.map(category => (
                <TableRow
                  className="border-b border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50"
                  key={category}
                >
                  <TableCell
                    className={cn(
                      `bg-gradient-to-r from-slate-50 to-gray-50 pl-4 font-bold text-slate-700`,
                      isFullscreen ? 'py-2 text-base' : 'py-3 text-sm',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {CATEGORY_NAMES[category]}
                      {/* 확장 룰 표시 */}
                      {category === 'threeOfAKind' && gameRoom.extendedRules?.enableThreeOfAKind && (
                        <Badge className="border-orange-300 bg-orange-100 text-xs text-orange-800" variant="outline">
                          확장
                        </Badge>
                      )}
                      {category === 'fullHouse' && gameRoom.extendedRules?.fullHouseFixedScore && (
                        <Badge className="border-orange-300 bg-orange-100 text-xs text-orange-800" variant="outline">
                          고정 25점
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {gameRoom.players.map(player => (
                    <TableCell className={cn('text-center', isFullscreen ? 'py-2' : 'py-3')} key={player.id}>
                      <div
                        className={cn(
                          `font-mono font-bold transition-all duration-200`,
                          isFullscreen ? 'text-xl' : 'text-lg',
                          player.scores[category] !== undefined ? 'text-slate-800' : 'text-slate-400',
                        )}
                      >
                        {player.scores[category] !== undefined ? player.scores[category] : '—'}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* 총점 */}
              <TableRow className="border-t-4 border-yellow-400 bg-gradient-to-r from-yellow-100/90 via-amber-100/90 to-orange-100/90 shadow-lg">
                <TableCell
                  className={cn(`pl-4 font-bold text-yellow-800`, isFullscreen ? 'py-4 text-xl' : 'py-4 text-lg')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <span>총점</span>
                  </div>
                </TableCell>
                {gameRoom.players.map(player => (
                  <TableCell className="py-4 text-center font-mono text-2xl font-bold text-yellow-700" key={player.id}>
                    {calculatePlayerTotal(player)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 하단 정보 - 전체화면에서는 숨김 */}
        {!isFullscreen && (
          <div className="mt-8 text-center text-white/80">
            <div className="inline-block rounded-2xl border border-white/20 bg-white/10 px-6 py-4 shadow-lg backdrop-blur-sm">
              <p className="mb-2 text-sm font-medium">
                방 ID:{' '}
                <span className="rounded bg-cyan-900/30 px-2 py-1 font-mono font-bold text-cyan-300">
                  {gameRoom.id}
                </span>
              </p>
              <p className="flex items-center justify-center gap-2 text-xs opacity-75">
                <span className="animate-pulse">🔄</span>
                실시간으로 업데이트되는 Yacht Dice 전광판
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
