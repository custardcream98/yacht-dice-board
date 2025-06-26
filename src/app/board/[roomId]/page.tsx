import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorFallback } from '@/components/ErrorFallback'
import { LoadingFallback } from '@/components/LoadingFallback'
import BoardPage from '@/components/pages/BoardPage'

export default async function GameBoardPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback>
          <p className="mb-4 text-red-600">게임방을 찾을 수 없습니다.</p>
          <p className="text-sm text-gray-600">방 ID를 확인하고 다시 시도해주세요.</p>
        </ErrorFallback>
      }
    >
      <Suspense fallback={<LoadingFallback />}>
        <BoardPage roomId={roomId} />
      </Suspense>
    </ErrorBoundary>
  )
}
