import { useMemo } from 'react'

import { useFirestoreDocument } from '@/hooks/useFirestoreDocument'
import { getGameRoomDocumentReference } from '@/lib/firebase/ref'

// 제네릭 Firestore 구독을 위한 스토어 클래스

/**
 * 게임방 데이터를 실시간으로 구독하는 훅
 * 제네릭 useFirestoreDocument 훅을 사용하는 특화된 버전
 */
export function useGameRoomData(roomId: string) {
  const docRef = useMemo(() => getGameRoomDocumentReference(roomId), [roomId])

  const gameRoom = useFirestoreDocument(docRef, '방이 삭제되었습니다.')

  return {
    gameRoom,
  }
}
