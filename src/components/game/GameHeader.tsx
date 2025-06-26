'use client'

import { ArrowLeft, Share2, Trash2, AlertTriangle, Users, ExternalLink, Monitor, UserPlus, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { GameRoom, Player } from '@/types/game'

import { LinkShareButton } from './LinkShareButton'

interface GameHeaderProps {
  currentPlayer?: Player
  gameRoom: GameRoom
  isMyTurn?: boolean
  myPlayer: Player
  onDeleteRoom: () => Promise<void>
}

export function GameHeader({ gameRoom, myPlayer, currentPlayer, isMyTurn, onDeleteRoom }: GameHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 링크 생성
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteUrl = `${baseUrl}/invite/${gameRoom.id}`
  const boardUrl = `${baseUrl}/board/${gameRoom.id}`

  const handleDeleteRoom = async () => {
    setIsDeleting(true)
    try {
      await onDeleteRoom()
      setIsDeleteDialogOpen(false)
      router.push('/')
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-20 border-b bg-white shadow-sm transition-transform duration-200',
        isScrolled && 'translate-y-[-44px] sm:translate-y-[-48px]',
      )}
    >
      <div className="p-3 sm:p-4">
        {/* 상단 버튼 영역 - 스크롤 시 숨김 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => router.push('/')}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />홈
            </Button>
            <div className="flex items-center gap-2">
              {/* 링크 공유 버튼 */}
              <Dialog onOpenChange={setIsShareDialogOpen} open={isShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Share2 className="mr-1 h-4 w-4" />
                    공유
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      링크 공유
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <LinkShareButton icon={UserPlus} label="초대 링크" url={inviteUrl} />

                    <LinkShareButton icon={Monitor} label="전광판 링크" url={boardUrl} />
                    <div className="rounded bg-green-50 p-2 text-xs text-gray-500">
                      📺 큰 화면에서 점수를 확인할 때 사용하세요.
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1" variant="outline">
                        <Link href={boardUrl} rel="noopener noreferrer" target="_blank">
                          <ExternalLink className="mr-1 h-4 w-4" />
                          전광판 열기
                        </Link>
                      </Button>
                      <Button className="flex-1" onClick={() => setIsShareDialogOpen(false)} variant="secondary">
                        닫기
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 방 삭제 버튼 */}
              <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="mr-1 h-4 w-4" />
                    삭제
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />방 삭제 확인
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                        <div className="text-sm text-red-700">
                          <p className="mb-2 font-medium">정말로 이 방을 삭제하시겠습니까?</p>
                          <ul className="list-inside list-disc space-y-1 text-xs">
                            <li>모든 플레이어가 방에서 나가게 됩니다</li>
                            <li>게임 진행 상황과 점수가 모두 삭제됩니다</li>
                            <li>삭제 후에는 복구가 불가능합니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" disabled={isDeleting} onClick={handleDeleteRoom} variant="destructive">
                        {isDeleting ? '삭제 중...' : '영구 삭제'}
                      </Button>
                      <Button disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
                        취소
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* 게임 정보 영역 - 항상 표시 */}
        <div className="text-center">
          <h1 className="mb-2 flex items-center justify-center gap-2 text-lg font-bold text-gray-800 sm:text-xl">
            {gameRoom.name}
            <div className="flex items-center gap-1 text-xs font-normal text-gray-500">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{gameRoom.players.length}명</span>
            </div>
          </h1>

          {/* 기본 게임 정보 */}
          <div className="mb-2 flex items-center justify-center gap-2 text-xs sm:gap-4 sm:text-sm">
            <Badge className="text-xs" variant="outline">
              나: {myPlayer.name}
            </Badge>
            {gameRoom.status === 'playing' && (
              <div className="text-sm font-medium">
                라운드 {gameRoom.currentRound} / {gameRoom.maxRounds}
              </div>
            )}
          </div>

          {/* 게임 진행 정보 - 게임 중일 때만 표시 */}
          {gameRoom.status === 'playing' && currentPlayer && (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                {/* 턴 상태 표시 */}
                {isMyTurn ? (
                  <div className="inline-block rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                    ✨ 당신의 차례입니다!
                  </div>
                ) : (
                  <div className="inline-block rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-600">
                    <Lock className="mr-1 inline h-3 w-3" />
                    {currentPlayer.name}님의 차례
                  </div>
                )}
                {gameRoom.currentRound === 1 && (
                  <div className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                    🎲 순서가 랜덤하게 섞였습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
