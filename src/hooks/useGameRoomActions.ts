import { useState } from 'react'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { GameRoom, Player } from '@/types/game'
import { MAX_ROUNDS } from '@/constants/game'

/**
 * 게임방 생성, 참여, 삭제 등의 액션을 담당하는 훅
 * 상태 변경 작업만 담당
 */
export function useGameRoomActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 방 생성
  const createRoom = async (roomName: string, playerName: string): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      console.log('방 생성 시작:', { roomName, playerName })

      if (!db) {
        throw new Error('Firestore 데이터베이스에 연결할 수 없습니다.')
      }

      const newPlayer: Player = {
        id: `player_${Date.now()}`,
        name: playerName,
        scores: {},
      }

      const newRoom: Omit<GameRoom, 'id'> = {
        name: roomName,
        players: [newPlayer],
        currentPlayerIndex: 0,
        currentRound: 1,
        maxRounds: MAX_ROUNDS,
        status: 'waiting',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      console.log('방 데이터 저장 시작:', newRoom)

      const roomsRef = collection(db, 'gameRooms')
      const docRef = await addDoc(roomsRef, newRoom)
      const roomId = docRef.id

      await updateDoc(docRef, { id: roomId })

      console.log('방 생성 완료:', roomId)
      return roomId
    } catch (err) {
      console.error('방 생성 오류:', err)
      let errorMessage = '방 생성에 실패했습니다.'

      if (err instanceof Error) {
        if (err.message.includes('Missing or insufficient permissions')) {
          errorMessage = 'Firestore 권한이 없습니다. Firebase Console에서 보안 규칙을 확인해주세요.'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 방 참여
  const joinRoom = async (roomId: string, playerName: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const roomRef = doc(db, 'gameRooms', roomId)
      const roomDoc = await getDoc(roomRef)

      if (!roomDoc.exists()) {
        throw new Error('존재하지 않는 방입니다.')
      }

      const room = roomDoc.data() as GameRoom

      if (room.status !== 'waiting') {
        throw new Error('이미 시작된 게임입니다.')
      }

      if (room.players.some(player => player.name === playerName)) {
        throw new Error('이미 존재하는 플레이어 이름입니다.')
      }

      const newPlayer: Player = {
        id: `player_${Date.now()}`,
        name: playerName,
        scores: {},
      }

      const updatedPlayers = [...room.players, newPlayer]

      await updateDoc(roomRef, {
        players: updatedPlayers,
        updatedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '방 참여에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 방 삭제
  const deleteRoom = async (roomId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const roomRef = doc(db, 'gameRooms', roomId)
      await deleteDoc(roomRef)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '방 삭제에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createRoom,
    joinRoom,
    deleteRoom,
  }
}
