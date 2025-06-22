'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LinkShareButton } from './LinkShareButton'
import { ArrowLeft, Share2, Trash2, AlertTriangle, Users, ExternalLink, Monitor, UserPlus } from 'lucide-react'
import { GameRoom, Player } from '@/types/game'

interface GameHeaderProps {
  gameRoom: GameRoom
  myPlayer: Player
  onDeleteRoom: () => Promise<void>
}

export function GameHeader({ gameRoom, myPlayer, onDeleteRoom }: GameHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
      <div className="p-4">
        <div className="flex items-center justify-between">
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
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    💡 초대 링크를 통해 접속하면 자동으로 플레이어 이름을 입력받습니다.
                  </div>

                  <LinkShareButton url={boardUrl} label="전광판 링크" icon={Monitor} />
                  <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                    📺 전광판 링크는 큰 화면에서 점수를 확인할 때 사용하세요.
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
                  <Trash2 className="h-4 w-4 mr-1" />방 삭제
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
        <div className="text-center mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{gameRoom.name}</h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant={gameRoom.status === 'playing' ? 'default' : 'secondary'}>
              {gameRoom.status === 'waiting' && '대기 중'}
              {gameRoom.status === 'playing' && '게임 진행 중'}
              {gameRoom.status === 'finished' && '게임 종료'}
            </Badge>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{gameRoom.players.length}명</span>
            </div>
            <Badge variant="outline" className="text-xs">
              나: {myPlayer.name}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
