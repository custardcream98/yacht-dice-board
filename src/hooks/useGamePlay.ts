import { useState } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { GameRoom, Player, ScoreCategory } from '@/types/game'

const shufflePlayers = (players: Player[]) => {
  const shuffledPlayers = [...players]
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]]
  }
  return shuffledPlayers
}

/**
 * 게임 플레이 관련 기능을 담당하는 훅
 * 게임 시작, 점수 입력 등의 게임 진행 로직만 담당
 */
export function useGamePlay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 게임 시작
  const startGame = async (roomId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const roomRef = doc(db, 'gameRooms', roomId)
      const roomDoc = await getDoc(roomRef)

      if (!roomDoc.exists()) {
        throw new Error('존재하지 않는 방입니다.')
      }

      const room = roomDoc.data() as GameRoom

      // Fisher-Yates 셔플 알고리즘으로 플레이어 순서 랜덤하게 섞기
      const shuffledPlayers = shufflePlayers(room.players)

      await updateDoc(roomRef, {
        players: shuffledPlayers,
        status: 'playing',
        currentPlayerIndex: 0,
        updatedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게임 시작에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 점수 입력
  const updateScore = async (
    roomId: string,
    playerId: string,
    category: ScoreCategory,
    score: number,
  ): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const roomRef = doc(db, 'gameRooms', roomId)
      const roomDoc = await getDoc(roomRef)

      if (!roomDoc.exists()) {
        throw new Error('존재하지 않는 방입니다.')
      }

      const room = roomDoc.data() as GameRoom
      const playerIndex = room.players.findIndex(p => p.id === playerId)

      if (playerIndex === -1) {
        throw new Error('존재하지 않는 플레이어입니다.')
      }

      // 이미 점수가 입력된 카테고리인지 확인
      if (room.players[playerIndex].scores[category] !== undefined) {
        throw new Error('이미 점수가 입력된 카테고리입니다.')
      }

      const updatedPlayers = [...room.players]
      updatedPlayers[playerIndex].scores[category] = score

      // 다음 플레이어로 턴 넘기기
      let nextPlayerIndex = room.currentPlayerIndex
      let nextRound = room.currentRound

      // 모든 플레이어가 이번 라운드를 완료했는지 확인
      const allPlayersCompletedRound = updatedPlayers.every(
        player => Object.keys(player.scores).length >= room.currentRound,
      )

      if (allPlayersCompletedRound && room.currentRound < room.maxRounds) {
        nextRound += 1
        nextPlayerIndex = 0
      } else {
        nextPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
      }

      // 게임 종료 조건 확인
      const gameStatus = room.currentRound >= room.maxRounds && allPlayersCompletedRound ? 'finished' : 'playing'

      await updateDoc(roomRef, {
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentRound: nextRound,
        status: gameStatus,
        updatedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '점수 입력에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 게임 재시작
  const restartGame = async (roomId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const roomRef = doc(db, 'gameRooms', roomId)
      const roomDoc = await getDoc(roomRef)

      if (!roomDoc.exists()) {
        throw new Error('존재하지 않는 방입니다.')
      }

      const room = roomDoc.data() as GameRoom

      // 모든 플레이어의 점수 초기화
      const resetPlayers = shufflePlayers(
        room.players.map(player => ({
          ...player,
          scores: {},
        })),
      )

      await updateDoc(roomRef, {
        players: resetPlayers,
        status: 'playing',
        currentPlayerIndex: 0,
        currentRound: 1,
        updatedAt: Date.now(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게임 재시작에 실패했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    startGame,
    updateScore,
    restartGame,
  }
}
