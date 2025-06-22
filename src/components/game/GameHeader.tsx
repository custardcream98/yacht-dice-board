'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LinkShareButton } from './LinkShareButton'
import { ArrowLeft, Share2, Trash2, AlertTriangle, Users, ExternalLink, Monitor, UserPlus, Lock } from 'lucide-react'
import { GameRoom, Player } from '@/types/game'

interface GameHeaderProps {
  gameRoom: GameRoom
  myPlayer: Player
  currentPlayer?: Player
  isMyTurn?: boolean
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
  const inviteUrl = `${baseUrl}/?roomId=${gameRoom.id}`
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
    <div className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="p-3 sm:p-4">
        {/* 상단 버튼 영역 - 스크롤 시 숨김 */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />홈
            </Button>
            <div className="flex items-center gap-2">
              {/* 링크 공유 버튼 */}
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
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
                    <LinkShareButton url={inviteUrl} label="초대 링크" icon={UserPlus} />

                    <LinkShareButton url={boardUrl} label="전광판 링크" icon={Monitor} />
                    <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                      📺 큰 화면에서 점수를 확인할 때 사용하세요.
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => window.open(boardUrl, '_blank')} variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        전광판 열기
                      </Button>
                      <Button onClick={() => setIsShareDialogOpen(false)} variant="secondary" className="flex-1">
                        닫기
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* 방 삭제 버튼 */}
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                          <p className="font-medium mb-2">정말로 이 방을 삭제하시겠습니까?</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>모든 플레이어가 방에서 나가게 됩니다</li>
                            <li>게임 진행 상황과 점수가 모두 삭제됩니다</li>
                            <li>삭제 후에는 복구가 불가능합니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={handleDeleteRoom} disabled={isDeleting} className="flex-1">
                        {isDeleting ? '삭제 중...' : '영구 삭제'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            {gameRoom.name}
            <div className="flex items-center gap-1 text-xs text-gray-500 font-normal">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{gameRoom.players.length}명</span>
            </div>
          </h1>

          {/* 기본 게임 정보 */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
            <Badge variant="outline" className="text-xs">
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
                <span className="text-xs text-gray-600">현재 차례:</span>
                <Badge variant={isMyTurn ? 'outline' : 'secondary'} className="text-xs">
                  {currentPlayer.name}
                  {isMyTurn && ' (나)'}
                </Badge>

                {/* 턴 상태 표시 */}
                {isMyTurn ? (
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                    ✨ 당신의 차례입니다!
                  </div>
                ) : (
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full inline-block">
                    <Lock className="h-3 w-3 inline mr-1" />
                    {currentPlayer.name}님의 차례
                  </div>
                )}
              </div>

              {gameRoom.currentRound === 1 && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                  🎲 순서가 랜덤하게 섞였습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
