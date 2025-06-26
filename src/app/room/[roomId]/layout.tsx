import type { Metadata } from 'next'

import { adminDb } from '@/lib/firebase/client/firebase-admin'

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params

  // roomId 검증
  if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
    return {
      title: '게임방',
      description: 'Yacht Dice 게임을 진행하세요.',
      openGraph: {
        title: 'Yacht Dice 게임방',
        description: 'Yacht Dice 게임을 진행하세요.',
      },
    }
  }

  try {
    // Firebase Admin SDK로 방 정보 가져오기
    const roomDoc = await adminDb.collection('gameRooms').doc(roomId.trim()).get()

    if (roomDoc.exists) {
      const roomData = roomDoc.data()
      const roomName = roomData?.name || '게임방'
      const status = roomData?.status || 'waiting'
      const playerCount = roomData?.players?.length || 0

      const statusText = status === 'waiting' ? '대기 중' : status === 'playing' ? '게임 진행 중' : '게임 종료'

      return {
        title: `${roomName} - ${statusText}`,
        description: `${roomName}에서 Yacht Dice 게임을 진행하세요. 현재 ${playerCount}명이 참여 중입니다.`,
        openGraph: {
          title: `${roomName} | Yacht Dice 게임방`,
          description: `${roomName}에서 Yacht Dice 게임을 진행하세요. 현재 ${statusText}입니다.`,
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

  // 기본 메타데이터
  return {
    title: '게임방',
    description: 'Yacht Dice 게임을 진행하세요.',
    openGraph: {
      title: 'Yacht Dice 게임방',
      description: 'Yacht Dice 게임을 진행하세요.',
    },
  }
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return children
}
