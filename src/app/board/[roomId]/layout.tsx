import type { Metadata } from 'next'

import { adminDb } from '@/lib/firebase-admin'
import { GameRoom } from '@/types/game'

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }): Promise<Metadata> {
  const { roomId } = await params

  // roomId 검증
  if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
    return {
      title: '전광판',
      description: 'Yacht Dice 게임의 점수를 실시간으로 확인하세요.',
      openGraph: {
        title: 'Yacht Dice 전광판',
        description: 'Yacht Dice 게임의 점수를 실시간으로 확인하세요.',
      },
    }
  }

  try {
    // Firebase Admin SDK로 방 정보 가져오기
    const roomDoc = await adminDb.collection('gameRooms').doc(roomId.trim()).get()

    let roomData: GameRoom | undefined
    if (roomDoc.exists && (roomData = roomDoc.data() as GameRoom)) {
      const roomName = roomData.name
      const status = roomData.status
      const playerCount = roomData.players.length
      const currentRound = roomData.currentRound
      const maxRounds = roomData.maxRounds

      let title = `${roomName} 전광판`
      let description = `${roomName}의 Yacht Dice 점수를 실시간으로 확인하세요.`

      if (status === 'playing') {
        title = `${roomName} 전광판 - ${currentRound}/${maxRounds} 라운드`
        description = `${roomName}에서 진행 중인 Yacht Dice 게임의 점수를 실시간으로 확인하세요. (${currentRound}/${maxRounds} 라운드, ${playerCount}명 참여)`
      } else if (status === 'finished') {
        title = `${roomName} 전광판 - 게임 종료`
        description = `${roomName}의 Yacht Dice 게임이 종료되었습니다. 최종 결과를 확인하세요.`
      }

      return {
        title,
        description,
        openGraph: {
          title: `${roomName} | Yacht Dice 전광판`,
          description,
        },
      }
    } else {
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
    title: '전광판',
    description: 'Yacht Dice 게임의 점수를 실시간으로 확인하세요.',
    openGraph: {
      title: 'Yacht Dice 전광판',
      description: 'Yacht Dice 게임의 점수를 실시간으로 확인하세요.',
    },
  }
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return children
}
