'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { GameHeader, WaitingRoom, ScoreInput, PlayerScoreSummary, GameFinished } from '@/components/game'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ValueConsumer } from '@/components/ValueConsumer'
import { useGamePlay, useGameRoomActions, useGameRoomData } from '@/hooks'
import { exhaustiveCheck } from '@/lib/types'
import { ExtendedRules, ScoreCategory } from '@/types/game'

export default function GameRoomPage({ roomId, playerName }: { roomId: string; playerName: string }) {
  const router = useRouter()

  const { gameRoom } = useGameRoomData(roomId)
  const { startGame, updateScore, restartGame } = useGamePlay()
  const { deleteRoom } = useGameRoomActions()

  // 현재 사용자와 현재 차례 플레이어 찾기
  const myPlayer = gameRoom.players.find(p => p.name === playerName)
  const currentPlayer = gameRoom.players[gameRoom.currentPlayerIndex]

  // 현재 플레이어의 차례인지 확인
  const isMyTurn = myPlayer && currentPlayer && myPlayer.id === currentPlayer.id

  // 점수 제출 핸들러
  const handleScoreSubmit = async (category: ScoreCategory, score: number) => {
    if (!gameRoom || !myPlayer) return

    try {
      await updateScore({ roomId, playerId: myPlayer.id, category, score })
    } catch (err) {
      alert(err instanceof Error ? err.message : '점수 입력에 실패했습니다.')
    }
  }

  // 게임 시작 핸들러
  const handleStartGame = async () => {
    try {
      await startGame(roomId)
    } catch (err) {
      alert(err instanceof Error ? err.message : '게임 시작에 실패했습니다.')
    }
  }

  // 방 삭제 핸들러
  const handleDeleteRoom = async () => {
    await deleteRoom(roomId)
    alert('방이 성공적으로 삭제되었습니다.')
  }

  // 게임 재시작 핸들러
  const handleRestartGame = async ({ extendedRules }: { extendedRules: ExtendedRules }) => {
    try {
      await restartGame({ roomId, extendedRules })
    } catch (err) {
      alert(err instanceof Error ? err.message : '게임 재시작에 실패했습니다.')
    }
  }

  // 플레이어가 없으면 에러 처리
  if (!myPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
        <Card className="w-full max-w-sm border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-yellow-600">
              {!playerName ? '플레이어 이름이 필요합니다.' : '해당 플레이어를 찾을 수 없습니다.'}
            </p>
            <p className="mb-4 text-sm text-gray-600">올바른 링크로 접속하거나 다시 방에 참여해주세요.</p>
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">현재 참가자:</p>
              <p className="text-sm font-medium">{gameRoom.players.map(p => p.name).join(', ')}</p>
            </div>
            <Button className="w-full" onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <GameHeader
        currentPlayer={currentPlayer}
        gameRoom={gameRoom}
        isMyTurn={!!isMyTurn}
        myPlayer={myPlayer}
        onDeleteRoom={handleDeleteRoom}
      />

      <div className="mx-auto max-w-md space-y-4 p-4">
        <ValueConsumer value={gameRoom.status}>
          {status => {
            switch (status) {
              case 'waiting':
                return <WaitingRoom gameRoom={gameRoom} myPlayer={myPlayer} onStartGame={handleStartGame} />
              case 'playing':
                return (
                  <>
                    <ScoreInput
                      extendedRules={gameRoom.extendedRules}
                      isMyTurn={!!isMyTurn}
                      myPlayer={myPlayer}
                      onScoreSubmit={handleScoreSubmit}
                    />

                    <PlayerScoreSummary gameRoom={gameRoom} myPlayer={myPlayer} />
                  </>
                )
              case 'finished':
                return <GameFinished gameRoom={gameRoom} myPlayer={myPlayer} onRestartGame={handleRestartGame} />
              default:
                exhaustiveCheck(status)
            }
          }}
        </ValueConsumer>

        {/* 하단 정보 */}
        <div className="pb-4 text-center text-sm text-gray-500">
          방 ID: <span className="font-mono font-bold">{gameRoom.id}</span>
        </div>
      </div>
    </div>
  )
}
