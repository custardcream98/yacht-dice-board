import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorFallback } from '@/components/ErrorFallback'
import { LoadingFallback } from '@/components/LoadingFallback'
import GameRoomPage from '@/components/pages/GameRoomPage'

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ player: string }>
}) {
  const { roomId } = await params
  const { player } = await searchParams

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback>
          <p className="text-red-600 mb-4">게임방을 찾을 수 없습니다.</p>
          <p className="text-sm text-gray-600">방 ID를 확인하고 다시 시도해주세요.</p>
        </ErrorFallback>
      }
    >
      <Suspense fallback={<LoadingFallback />}>
        <GameRoomPage playerName={player} roomId={roomId} />
      </Suspense>
    </ErrorBoundary>
  )
}
