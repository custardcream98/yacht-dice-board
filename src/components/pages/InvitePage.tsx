'use client'

import { UserPlus, Monitor, Users, ArrowLeft, GamepadIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useId, useMemo, useState, useTransition } from 'react'

import { QRCodeShareButton } from '@/components/game'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGameRoomData, useGameRoomActions } from '@/hooks'

interface InvitePageProps {
  roomId: string
}

export default function InvitePage({ roomId }: InvitePageProps) {
  const router = useRouter()
  const [isRouterPushPending, startTransition] = useTransition()
  const [playerName, setPlayerName] = useState('')
  const name = playerName.trim()
  const [isJoining, setIsJoining] = useState(false)

  const { gameRoom } = useGameRoomData(roomId)
  const { joinRoom } = useGameRoomActions()

  const nameFormId = useId()

  // 방 참여 핸들러
  const handleJoinRoom: React.FormEventHandler<HTMLFormElement> = useCallback(
    async event => {
      event.preventDefault()

      if (!name) {
        alert('플레이어 이름을 입력해주세요.')
        return
      }

      setIsJoining(true)
      try {
        await joinRoom(roomId, name)
        startTransition(() => {
          router.push(`/room/${roomId}?player=${encodeURIComponent(name)}`)
        })
      } catch (error) {
        alert(error instanceof Error ? error.message : '방 참여에 실패했습니다.')
      } finally {
        setIsJoining(false)
      }
    },
    [name, joinRoom, roomId, router],
  )

  const hasExtendedRules = useMemo(
    () => Object.values(gameRoom.extendedRules).some(rule => rule),
    [gameRoom.extendedRules],
  )

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
                  <Badge className="px-3 py-1" variant={gameRoom.status === 'playing' ? 'default' : 'secondary'}>
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
                      <Badge className="text-xs" key={player.id} variant="outline">
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

        {/* 확장 룰 정보 */}
        {hasExtendedRules && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Settings className="h-4 w-4" />
                <span className="text-sm">확장 룰 적용</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
              <ul className="space-y-2">
                {gameRoom.extendedRules.fullHouseFixedScore && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-800">Full House 고정 점수 (25점)</span>
                  </li>
                )}
                {gameRoom.extendedRules.enableThreeOfAKind && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-800">3 of a Kind 족보 추가</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

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
              <label className="block text-sm font-medium mb-2" htmlFor="playerName">
                {gameRoom.players.length === 0 ? '방장 이름' : '플레이어 이름'}
              </label>
              <Input
                className="text-center text-lg font-medium"
                disabled={isJoining}
                id="playerName"
                maxLength={20}
                onChange={e => setPlayerName(e.target.value)}
                placeholder={gameRoom.players.length === 0 ? '방장 이름을 입력하세요' : '이름을 입력하세요'}
                value={playerName}
              />
            </form>

            <Button
              className="w-full h-12 text-lg font-bold"
              disabled={isJoining || isRouterPushPending || !name}
              form={nameFormId}
              type="submit"
            >
              <Users className="h-5 w-5 mr-2" />
              {isJoining || isRouterPushPending
                ? '참여 중...'
                : gameRoom.players.length === 0
                  ? '방장으로 시작하기'
                  : '게임 참여하기'}
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
              <QRCodeShareButton className="w-full h-12 text-lg font-bold" roomId={roomId} />
            </div>

            <div className="border-t border-gray-200"></div>

            {/* 전광판 바로가기 */}
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">게임에 참여하지 않고 점수만 확인하고 싶다면</div>
              <Button asChild className="w-full h-12 text-lg font-bold" variant="outline">
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
          <Button asChild className="text-gray-500 hover:text-gray-700" size="sm" variant="ghost">
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
