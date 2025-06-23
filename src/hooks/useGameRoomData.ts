import { doc, onSnapshot } from 'firebase/firestore'
import { useState, useEffect } from 'react'

import { db } from '@/lib/firebase'
import { GameRoom } from '@/types/game'

/**
 * 게임방 데이터를 실시간으로 구독하는 훅
 * 단순히 데이터 조회와 실시간 업데이트만 담당
 */
export function useGameRoomData(roomId?: string) {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    if (!roomId) {
      setGameRoom(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const roomRef = doc(db, 'gameRooms', roomId)

    const unsubscribe = onSnapshot(
      roomRef,
      doc => {
        if (doc.exists()) {
          setGameRoom(doc.data() as GameRoom)
        } else {
          setGameRoom(null)
          setError('방이 삭제되었습니다.')
        }
        setLoading(false)
      },
      error => {
        setError(error.message)
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [roomId])

  return {
    gameRoom,
    loading,
    error,
  }
}
