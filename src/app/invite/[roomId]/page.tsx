import { GamepadIcon } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorFallback } from '@/components/ErrorFallback'
import { LoadingFallback } from '@/components/LoadingFallback'
import InvitePage from '@/components/pages/InvitePage'

export default async function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback>
          <div className="mb-4 text-red-600">
            <GamepadIcon className="mx-auto mb-3 h-12 w-12" />
            <h2 className="mb-2 text-xl font-bold">게임방을 찾을 수 없습니다</h2>
            <p className="text-sm">방 ID를 확인하고 다시 시도해주세요.</p>
          </div>
        </ErrorFallback>
      }
    >
      <Suspense fallback={<LoadingFallback />}>
        <InvitePage roomId={roomId} />
      </Suspense>
    </ErrorBoundary>
  )
}
