'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Monitor, Users, Dice6, ArrowLeft, GamepadIcon } from 'lucide-react'
import { useGameRoomData, useGameRoomActions } from '@/hooks'
import { QRCodeShareButton } from '@/components/game'
import Link from 'next/link'

interface InvitePageProps {
  roomId: string
}

export default function InvitePage({ roomId }: InvitePageProps) {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const name = playerName.trim()
  const [isJoining, setIsJoining] = useState(false)

  const { gameRoom, loading, error } = useGameRoomData(roomId)
  const { joinRoom } = useGameRoomActions()

  const nameFormId = useId()

  // 방 참여 핸들러
  const handleJoinRoom = async () => {
    if (!name) {
      alert('플레이어 이름을 입력해주세요.')
      return
    }

    setIsJoining(true)
    try {
      await joinRoom(roomId, name)
      router.push(`/room/${roomId}?player=${encodeURIComponent(name)}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 참여에 실패했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8">
            <div className="animate-spin mb-4">
              <Dice6 className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-lg text-center text-gray-700">게임 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !gameRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-red-50 border-red-200">
          <CardContent className="text-center p-8">
            <div className="text-red-600 mb-4">
              <GamepadIcon className="h-12 w-12 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">게임방을 찾을 수 없습니다</h2>
              <p className="text-sm">{error || '방 ID를 확인하고 다시 시도해주세요.'}</p>
            </div>
            <Button onClick={() => router.push('/')} className="w-full mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              {gameRoom.players.length === 0 ? '게임 시작하기' : '게임 참여하기'}
            </h1>
          </div>
          <p className="text-gray-600">
            {gameRoom.players.length === 0 ? '방장으로 게임을 시작하세요!' : 'Yacht Dice 게임에 참여하세요!'}
          </p>
        </div>

        {/* 게임방 정보 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-1">{gameRoom.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={gameRoom.status === 'playing' ? 'default' : 'secondary'} className="px-3 py-1">
                    {gameRoom.status === 'waiting' && '대기 중'}
                    {gameRoom.status === 'playing' && '게임 진행 중'}
                    {gameRoom.status === 'finished' && '게임 종료'}
                  </Badge>
                </div>
              </div>

              {gameRoom.players.length > 0 && (
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">참여자 ({gameRoom.players.length}명)</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {gameRoom.players.map(player => (
                      <Badge key={player.id} variant="outline" className="text-xs">
                        {player.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-blue-600">
                방 ID: <span className="font-mono font-bold">{roomId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 게임 참여 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GamepadIcon className="h-5 w-5" />
              {gameRoom.players.length === 0 ? '방장으로 시작하기' : '게임 참여하기'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form id={nameFormId} onSubmit={handleJoinRoom}>
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                {gameRoom.players.length === 0 ? '방장 이름' : '플레이어 이름'}
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder={gameRoom.players.length === 0 ? '방장 이름을 입력하세요' : '이름을 입력하세요'}
                className="text-center text-lg font-medium"
                maxLength={20}
                disabled={isJoining}
              />
            </form>

            <Button
              form={nameFormId}
              type="submit"
              className="w-full h-12 text-lg font-bold"
              disabled={isJoining || !name}
            >
              <Users className="h-5 w-5 mr-2" />
              {isJoining ? '참여 중...' : gameRoom.players.length === 0 ? '방장으로 시작하기' : '게임 참여하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 추가 기능들 */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* QR 코드 공유 */}
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">
                {gameRoom.players.length === 0 ? '친구들을 초대하세요!' : '더 많은 친구들을 초대하고 싶다면'}
              </div>
              <QRCodeShareButton roomId={roomId} className="w-full h-12 text-lg font-bold" />
            </div>

            <div className="border-t border-gray-200"></div>

            {/* 전광판 바로가기 */}
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">게임에 참여하지 않고 점수만 확인하고 싶다면</div>
              <Button asChild variant="outline" className="w-full h-12 text-lg font-bold">
                <Link href={`/board/${roomId}`}>
                  <Monitor className="h-5 w-5 mr-2" />
                  전광판으로 이동하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 하단 정보 */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>친구들과 함께 Yacht Dice를 즐겨보세요!</p>
          <Button asChild variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <Link href="/">
              <ArrowLeft className="h-3 w-3 mr-1" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
