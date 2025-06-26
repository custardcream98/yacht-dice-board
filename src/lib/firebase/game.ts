import { getDoc, updateDoc } from 'firebase/firestore'

import { FirebaseCustomError } from '@/lib/firebase/error'
import { getGameRoomDocumentReference } from '@/lib/firebase/ref'
import { ExtendedRules, Player, ScoreCategory } from '@/types/game'

/**
 * Fisher-Yates 셔플 알고리즘
 */
const shufflePlayers = (players: Player[]) => {
  const shuffledPlayers = [...players]
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]]
  }
  return shuffledPlayers
}

const ROOM_NOT_FOUND_ERROR_CODE = 'ROOM_NOT_FOUND'

export const START_GAME_ERROR_CODES = {
  ROOM_NOT_FOUND: ROOM_NOT_FOUND_ERROR_CODE,
} as const
export const isStartGameErrorCode = (errorCode: string): errorCode is keyof typeof START_GAME_ERROR_CODES =>
  errorCode in START_GAME_ERROR_CODES

const startGame = async (roomId: string) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw new FirebaseCustomError(START_GAME_ERROR_CODES.ROOM_NOT_FOUND)
  }

  const room = roomDoc.data()

  const shuffledPlayers = shufflePlayers(room.players)

  await updateDoc(roomRef, {
    players: shuffledPlayers,
    status: 'playing',
    currentPlayerIndex: 0,
    updatedAt: Date.now(),
  })
}

export const SUBMIT_SCORE_ERROR_CODES = {
  ROOM_NOT_FOUND: ROOM_NOT_FOUND_ERROR_CODE,
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  CATEGORY_ALREADY_SCORED: 'CATEGORY_ALREADY_SCORED',
} as const
export const isSubmitScoreErrorCode = (errorCode: string): errorCode is keyof typeof SUBMIT_SCORE_ERROR_CODES =>
  errorCode in SUBMIT_SCORE_ERROR_CODES

const submitScore = async ({
  roomId,
  playerId,
  category,
  score,
}: {
  roomId: string
  playerId: string
  category: ScoreCategory
  score: number
}) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw new FirebaseCustomError(SUBMIT_SCORE_ERROR_CODES.ROOM_NOT_FOUND)
  }

  const room = roomDoc.data()
  const playerIndex = room.players.findIndex(p => p.id === playerId)

  if (playerIndex === -1) {
    throw new FirebaseCustomError(SUBMIT_SCORE_ERROR_CODES.PLAYER_NOT_FOUND)
  }

  if (room.players[playerIndex].scores[category] !== undefined) {
    throw new FirebaseCustomError(SUBMIT_SCORE_ERROR_CODES.CATEGORY_ALREADY_SCORED)
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
}

export const RESTART_GAME_ERROR_CODES = {
  ROOM_NOT_FOUND: ROOM_NOT_FOUND_ERROR_CODE,
} as const
export const isRestartGameErrorCode = (errorCode: string): errorCode is keyof typeof RESTART_GAME_ERROR_CODES =>
  errorCode in RESTART_GAME_ERROR_CODES

const restartGame = async ({ roomId, extendedRules }: { roomId: string; extendedRules: ExtendedRules }) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw new FirebaseCustomError(RESTART_GAME_ERROR_CODES.ROOM_NOT_FOUND)
  }

  const room = roomDoc.data()

  // 모든 플레이어의 점수 초기화
  const resetPlayers = shufflePlayers(
    room.players.map(player => ({
      ...player,
      scores: {},
    })),
  )

  await updateDoc(roomRef, {
    players: resetPlayers,
    extendedRules,
    status: 'playing',
    currentPlayerIndex: 0,
    currentRound: 1,
    updatedAt: Date.now(),
  })
}

export const UPDATE_SCORE_ERROR_CODES = {
  ROOM_NOT_FOUND: ROOM_NOT_FOUND_ERROR_CODE,
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
} as const
export const isUpdateScoreErrorCode = (errorCode: string): errorCode is keyof typeof UPDATE_SCORE_ERROR_CODES =>
  errorCode in UPDATE_SCORE_ERROR_CODES

const updateScore = async ({
  roomId,
  playerId,
  category,
  score,
}: {
  roomId: string
  playerId: string
  category: ScoreCategory
  score: number
}) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw new FirebaseCustomError(UPDATE_SCORE_ERROR_CODES.ROOM_NOT_FOUND)
  }

  const room = roomDoc.data()
  const playerIndex = room.players.findIndex(p => p.id === playerId)

  if (playerIndex === -1) {
    throw new FirebaseCustomError(UPDATE_SCORE_ERROR_CODES.PLAYER_NOT_FOUND)
  }

  const updatedPlayers = [...room.players]
  updatedPlayers[playerIndex].scores[category] = score

  await updateDoc(roomRef, {
    players: updatedPlayers,
    updatedAt: Date.now(),
  })
}

export const gameActions = {
  startGame,
  submitScore,
  updateScore,
  restartGame,
}
