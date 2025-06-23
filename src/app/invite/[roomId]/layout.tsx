import type { Metadata } from 'next'
import { adminDb } from '@/lib/firebase-admin'

const DEFAULT_METADATA = {
  title: 'Yacht Dice 초대링크',
  description: 'Yacht Dice 게임에 초대되었습니다.',
  openGraph: {
    title: 'Yacht Dice 초대링크',
    description: 'Yacht Dice 게임에 초대되었습니다.',
  },
} as const satisfies Metadata

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params

  // roomId 검증
  if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
    return DEFAULT_METADATA
  }

  try {
    const roomDoc = await adminDb.collection('gameRooms').doc(roomId.trim()).get()

    if (roomDoc.exists) {
      const roomData = roomDoc.data()
      const roomName = roomData?.name || '게임방'

      const title = `${roomName} 초대링크`
      const description = `${roomName} Yacht Dice 게임에 초대되었습니다.`

      return {
        title,
        description,
        openGraph: {
          title: `${roomName} | Yacht Dice 초대링크`,
          description,
        },
      }
    }
  } catch (error) {
    console.error('메타데이터 생성 중 오류:', error)
    console.error('Error details:', {
      roomId,
      error: error instanceof Error ? error.message : error,
    })
  }

  return DEFAULT_METADATA
}

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children
}
