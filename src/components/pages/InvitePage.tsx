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
import { useAsyncHandler } from '@/hooks/useAsyncHandler'
import { useGameRoomData } from '@/hooks/useGameRoomData'
import { FirebaseCustomError } from '@/lib/firebase/error'
import { isJoinRoomErrorCode, JOIN_ROOM_ERROR_CODES, roomActions } from '@/lib/firebase/room'

interface InvitePageProps {
  roomId: string
}

const JOIN_ROOM_ERROR_MESSAGES = {
  [JOIN_ROOM_ERROR_CODES.ROOM_NOT_FOUND]: '존재하지 않는 방입니다.',
  [JOIN_ROOM_ERROR_CODES.ROOM_ALREADY_STARTED]: '이미 시작된 게임입니다.',
  [JOIN_ROOM_ERROR_CODES.PLAYER_NAME_ALREADY_EXISTS]: '이미 존재하는 플레이어 이름입니다.',
  [JOIN_ROOM_ERROR_CODES.MAX_PLAYERS_REACHED]: '방에 최대 10명까지 참여할 수 있습니다.',
} as const

export default function InvitePage({ roomId }: InvitePageProps) {
  const router = useRouter()
  const [isRouterPushPending, startTransition] = useTransition()
  const [playerName, setPlayerName] = useState('')
  const name = playerName.trim()

  const { gameRoom } = useGameRoomData(roomId)
  const { handleAsync: joinRoom, isPending: isJoinRoomPending } = useAsyncHandler(roomActions.joinRoom)

  const nameFormId = useId()

  // 방 참여 핸들러
  const handleJoinRoom: React.FormEventHandler<HTMLFormElement> = useCallback(
    async event => {
      event.preventDefault()

      if (!name) {
        alert('플레이어 이름을 입력해주세요.')
        return
      }

      try {
        await joinRoom({ roomId, playerName: name })
        startTransition(() => {
          router.push(`/room/${roomId}?player=${encodeURIComponent(name)}`)
        })
      } catch (error) {
        alert(
          error instanceof FirebaseCustomError && isJoinRoomErrorCode(error.code)
            ? JOIN_ROOM_ERROR_MESSAGES[error.code]
            : '방 참여에 실패했습니다.',
        )
      }
    },
    [name, joinRoom, roomId, router],
  )

  const hasExtendedRules = useMemo(
    () => Object.values(gameRoom.extendedRules).some(rule => rule),
    [gameRoom.extendedRules],
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
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
            <div className="space-y-3 text-center">
              <div>
                <h2 className="mb-1 text-xl font-bold text-blue-800">{gameRoom.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="px-3 py-1" variant={gameRoom.status === 'playing' ? 'default' : 'secondary'}>
                    {gameRoom.status === 'waiting' && '대기 중'}
                    {gameRoom.status === 'playing' && '게임 진행 중'}
                    {gameRoom.status === 'finished' && '게임 종료'}
                  </Badge>
                </div>
              </div>

              {gameRoom.players.length > 0 && (
                <div className="rounded-lg bg-white/50 p-3">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">참여자 ({gameRoom.players.length}명)</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
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
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-orange-800">Full House 고정 점수 (25점)</span>
                  </li>
                )}
                {gameRoom.extendedRules.enableThreeOfAKind && (
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
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
              <label className="mb-2 block text-sm font-medium" htmlFor="playerName">
                {gameRoom.players.length === 0 ? '방장 이름' : '플레이어 이름'}
              </label>
              <Input
                className="text-center text-lg font-medium"
                disabled={isJoinRoomPending}
                id="playerName"
                maxLength={20}
                onChange={e => setPlayerName(e.target.value)}
                placeholder={gameRoom.players.length === 0 ? '방장 이름을 입력하세요' : '이름을 입력하세요'}
                value={playerName}
              />
            </form>

            <Button
              className="h-12 w-full text-lg font-bold"
              disabled={isJoinRoomPending || isRouterPushPending || !name}
              form={nameFormId}
              type="submit"
            >
              <Users className="mr-2 h-5 w-5" />
              {isJoinRoomPending || isRouterPushPending
                ? '참여 중...'
                : gameRoom.players.length === 0
                  ? '방장으로 시작하기'
                  : '게임 참여하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 추가 기능들 */}
        <Card>
          <CardContent className="space-y-4 p-4">
            {/* QR 코드 공유 */}
            <div className="space-y-3 text-center">
              <div className="text-sm text-gray-600">
                {gameRoom.players.length === 0 ? '친구들을 초대하세요!' : '더 많은 친구들을 초대하고 싶다면'}
              </div>
              <QRCodeShareButton className="h-12 w-full text-lg font-bold" roomId={roomId} />
            </div>

            <div className="border-t border-gray-200"></div>

            {/* 전광판 바로가기 */}
            <div className="space-y-3 text-center">
              <div className="text-sm text-gray-600">게임에 참여하지 않고 점수만 확인하고 싶다면</div>
              <Button asChild className="h-12 w-full text-lg font-bold" variant="outline">
                <Link href={`/board/${roomId}`}>
                  <Monitor className="mr-2 h-5 w-5" />
                  전광판으로 이동하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 하단 정보 */}
        <div className="space-y-1 text-center text-sm text-gray-500">
          <p>친구들과 함께 Yacht Dice를 즐겨보세요!</p>
          <Button asChild className="text-gray-500 hover:text-gray-700" size="sm" variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-1 h-3 w-3" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
