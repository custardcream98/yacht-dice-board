'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreCategory } from '@/types/game'
import { Dice6, ArrowLeft } from 'lucide-react'

import { GameHeader, WaitingRoom, ScoreInput, PlayerScoreSummary, GameFinished } from '@/components/game'
import { useGamePlay, useGameRoomActions, useGameRoomData } from '@/hooks'

export default function GameRoomPage({ roomId, playerName }: { roomId: string; playerName: string }) {
  const router = useRouter()

  const { gameRoom, loading, error } = useGameRoomData(roomId)
  const { startGame, updateScore } = useGamePlay()
  const { deleteRoom } = useGameRoomActions()

  // 현재 사용자와 현재 차례 플레이어 찾기
  const myPlayer = gameRoom?.players.find(p => p.name === playerName)
  const currentPlayer = gameRoom?.players[gameRoom.currentPlayerIndex]

  // 현재 플레이어의 차례인지 확인
  const isMyTurn = myPlayer && currentPlayer && myPlayer.id === currentPlayer.id

  // 점수 제출 핸들러
  const handleScoreSubmit = async (category: ScoreCategory, score: number) => {
    if (!gameRoom || !myPlayer) return

    try {
      await updateScore(roomId, myPlayer.id, category, score)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center p-8">
            <div className="animate-spin mb-4">
              <Dice6 className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-lg text-center">게임 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !gameRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-red-50 border-red-200">
          <CardContent className="text-center p-8">
            <p className="text-red-600 mb-4">{error || '게임방을 찾을 수 없습니다.'}</p>
            <p className="text-sm text-gray-600">방 ID를 확인하고 다시 시도해주세요.</p>
            <Button onClick={() => router.push('/')} className="mt-4 w-full" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 플레이어 이름이 없거나 해당 플레이어를 찾을 수 없는 경우
  if (!playerName || !myPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-yellow-50 border-yellow-200">
          <CardContent className="text-center p-8">
            <p className="text-yellow-600 mb-4">
              {!playerName ? '플레이어 이름이 필요합니다.' : '해당 플레이어를 찾을 수 없습니다.'}
            </p>
            <p className="text-sm text-gray-600 mb-4">올바른 링크로 접속하거나 다시 방에 참여해주세요.</p>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">현재 참가자:</p>
              <p className="text-sm font-medium">{gameRoom.players.map(p => p.name).join(', ')}</p>
            </div>
            <Button onClick={() => router.push('/')} className="w-full" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
        gameRoom={gameRoom}
        myPlayer={myPlayer}
        currentPlayer={currentPlayer}
        isMyTurn={!!isMyTurn}
        onDeleteRoom={handleDeleteRoom}
      />

      <div className="p-4 space-y-4">
        {/* 게임 시작 전 대기실 */}
        <WaitingRoom gameRoom={gameRoom} myPlayer={myPlayer} onStartGame={handleStartGame} />

        {/* 게임 진행 중 */}
        {gameRoom.status === 'playing' && (
          <>
            {/* 점수 입력 */}
            <ScoreInput myPlayer={myPlayer} isMyTurn={!!isMyTurn} onScoreSubmit={handleScoreSubmit} />

            {/* 내 점수 요약 */}
            <PlayerScoreSummary player={myPlayer} />
          </>
        )}

        {/* 게임 종료 */}
        <GameFinished gameRoom={gameRoom} />

        {/* 하단 정보 */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>
            방 ID: <span className="font-mono font-bold">{gameRoom.id}</span>
          </p>
          <p className="mt-1">
            플레이어: <span className="font-bold">{myPlayer.name}</span>
          </p>
          <p className="mt-1">Yacht Dice 모바일 게임</p>
        </div>
      </div>
    </div>
  )
}
