'use client'

import { useId, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useGameRoomActions } from '@/hooks'

export function DeleteRoomCard() {
  const [deleteRoomId, setDeleteRoomId] = useState('')
  const roomId = deleteRoomId.trim()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { deleteRoom } = useGameRoomActions()

  const handleDeleteRoom = async () => {
    if (!roomId) {
      alert('삭제할 방 ID를 입력해주세요.')
      return
    }

    setIsDeleting(true)
    try {
      await deleteRoom(roomId)

      setDeleteRoomId('')
      setIsDeleteDialogOpen(false)
      alert('방이 성공적으로 삭제되었습니다.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />방 삭제
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />방 삭제하기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />방 삭제
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <RoomIdInput deleteRoomId={deleteRoomId} onRoomIdChange={setDeleteRoomId} />
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-2">주의사항</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>모든 플레이어가 방에서 나가게 됩니다</li>
                      <li>게임 진행 상황과 점수가 모두 삭제됩니다</li>
                      <li>삭제 후에는 복구가 불가능합니다</li>
                      <li>방장이 아니어도 방 ID만 알면 삭제 가능합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteRoom}
                  disabled={isDeleting || !roomId}
                  className="flex-1"
                >
                  {isDeleting ? '삭제 중...' : '영구 삭제'}
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

const RoomIdInput = ({
  deleteRoomId,
  onRoomIdChange,
}: {
  deleteRoomId: string
  onRoomIdChange: (value: string) => void
}) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        삭제할 방 ID
      </label>
      <Input
        id={id}
        value={deleteRoomId}
        onChange={e => onRoomIdChange(e.currentTarget.value)}
        placeholder="방 ID를 입력하세요"
        className="font-mono"
      />
    </div>
  )
}
