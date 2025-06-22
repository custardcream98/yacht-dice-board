'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppHeader,
  InviteNotice,
  PlayerNameInput,
  CreateRoomCard,
  JoinRoomCard,
  DeleteRoomCard,
  AppFooter,
} from '@/components/home'
import { useGameRoomActions } from '@/hooks'

export default function HomePage({ roomId }: { roomId: string }) {
  const router = useRouter()

  const [playerName, setPlayerName] = useState('')

  const { createRoom, joinRoom, deleteRoom } = useGameRoomActions()

  // 방 생성 핸들러
  const handleCreateRoom = async (roomName: string) => {
    const roomId = await createRoom(roomName, playerName.trim())
    router.push(`/room/${roomId}?player=${encodeURIComponent(playerName.trim())}`)
  }

  // 방 참여 핸들러
  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId, playerName.trim())
    router.push(`/room/${roomId}?player=${encodeURIComponent(playerName.trim())}`)
  }

  // 방 삭제 핸들러
  const handleDeleteRoom = async (roomId: string) => {
    await deleteRoom(roomId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <AppHeader />

        {/* 초대링크로 접속한 경우 안내 */}
        {roomId && <InviteNotice roomId={roomId} />}

        {/* 플레이어 이름 입력 */}
        <PlayerNameInput playerName={playerName} onPlayerNameChange={setPlayerName} />

        {/* 방 생성 */}
        {!roomId && <CreateRoomCard playerName={playerName} onCreateRoom={handleCreateRoom} />}

        {/* 방 참여 */}
        <JoinRoomCard playerName={playerName} inviteRoomId={roomId || undefined} onJoinRoom={handleJoinRoom} />

        {/* 방 삭제 */}
        {!roomId && <DeleteRoomCard onDeleteRoom={handleDeleteRoom} />}

        {/* 하단 정보 */}
        <AppFooter />
      </div>
    </div>
  )
}
