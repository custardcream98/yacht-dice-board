import { doc } from 'firebase/firestore'
import { useMemo } from 'react'

import { useFirestoreDocument } from '@/hooks/useFirestoreDocument'
import { db } from '@/lib/firebase'
import { GameRoom } from '@/types/game'

// 제네릭 Firestore 구독을 위한 스토어 클래스

/**
 * 게임방 데이터를 실시간으로 구독하는 훅
 * 제네릭 useFirestoreDocument 훅을 사용하는 특화된 버전
 */
export function useGameRoomData(roomId: string) {
  const docRef = useMemo(() => {
    return doc(db, 'gameRooms', roomId)
  }, [roomId])

  const gameRoom = useFirestoreDocument<GameRoom>(docRef, '방이 삭제되었습니다.')

  return {
    gameRoom,
  }
}
