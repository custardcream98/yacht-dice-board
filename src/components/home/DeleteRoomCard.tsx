'use client'

import { Trash2, AlertTriangle } from 'lucide-react'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAsyncHandler } from '@/hooks/useAsyncHandler'
import { roomActions } from '@/lib/firebase/room'

export function DeleteRoomCard() {
  const [deleteRoomId, setDeleteRoomId] = useState('')
  const roomId = deleteRoomId.trim()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { handleAsync: deleteRoom, isPending: isDeleteRoomPending } = useAsyncHandler(roomActions.deleteRoom)

  const handleDeleteRoom = async () => {
    if (!roomId) {
      alert('삭제할 방 ID를 입력해주세요.')
      return
    }

    try {
      await deleteRoom(roomId)

      setDeleteRoomId('')
      setIsDeleteDialogOpen(false)
      alert('방이 성공적으로 삭제되었습니다.')
    } catch (error) {
      alert(error instanceof Error ? error.message : '방 삭제에 실패했습니다.')
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
        <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />방 삭제하기
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                  <div className="text-sm text-red-700">
                    <p className="mb-2 font-medium">주의사항</p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
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
                  className="flex-1"
                  disabled={isDeleteRoomPending || !roomId}
                  onClick={handleDeleteRoom}
                  variant="destructive"
                >
                  {isDeleteRoomPending ? '삭제 중...' : '영구 삭제'}
                </Button>
                <Button disabled={isDeleteRoomPending} onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
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
      <label className="mb-2 block text-sm font-medium" htmlFor={id}>
        삭제할 방 ID
      </label>
      <Input
        className="font-mono"
        id={id}
        maxLength={50}
        onChange={e => onRoomIdChange(e.currentTarget.value)}
        placeholder="방 ID를 입력하세요"
        value={deleteRoomId}
      />
    </div>
  )
}
