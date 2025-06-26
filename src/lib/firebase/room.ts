import { addDoc, collection, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'

import { MAX_ROUNDS, MAX_ROUNDS_WITH_THREE_OF_A_KIND_EXTENDED_RULE } from '@/constants/game'
import { db } from '@/lib/firebase/client/firebase'
import { FirebaseCustomError } from '@/lib/firebase/error'
import { getGameRoomDocumentReference } from '@/lib/firebase/ref'
import { DEFAULT_EXTENDED_RULES, ExtendedRules, GameRoom, Player } from '@/types/game'

const createRoom = async ({
  roomName,
  extendedRules = DEFAULT_EXTENDED_RULES,
}: {
  roomName: string
  extendedRules?: ExtendedRules
}) => {
  const newRoom: Omit<GameRoom, 'id'> = {
    name: roomName,
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    maxRounds: extendedRules.enableThreeOfAKind ? MAX_ROUNDS_WITH_THREE_OF_A_KIND_EXTENDED_RULE : MAX_ROUNDS,
    extendedRules,
    status: 'waiting',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const roomsRef = collection(db, 'gameRooms')
  const docRef = await addDoc(roomsRef, newRoom)
  const roomId = docRef.id

  await updateDoc(docRef, { id: roomId })

  return roomId
}

export const JOIN_ROOM_ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_ALREADY_STARTED: 'ROOM_ALREADY_STARTED',
  PLAYER_NAME_ALREADY_EXISTS: 'PLAYER_NAME_ALREADY_EXISTS',
  MAX_PLAYERS_REACHED: 'MAX_PLAYERS_REACHED',
} as const

export const isJoinRoomErrorCode = (errorCode: string): errorCode is keyof typeof JOIN_ROOM_ERROR_CODES =>
  errorCode in JOIN_ROOM_ERROR_CODES

const joinRoom = async ({ roomId, playerName }: { roomId: string; playerName: string }) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw new FirebaseCustomError(JOIN_ROOM_ERROR_CODES.ROOM_NOT_FOUND)
  }

  const room = roomDoc.data()

  if (room.status !== 'waiting') {
    throw new FirebaseCustomError(JOIN_ROOM_ERROR_CODES.ROOM_ALREADY_STARTED)
  }

  if (room.players.some(player => player.name === playerName)) {
    throw new FirebaseCustomError(JOIN_ROOM_ERROR_CODES.PLAYER_NAME_ALREADY_EXISTS)
  }

  if (room.players.length >= 10) {
    throw new FirebaseCustomError(JOIN_ROOM_ERROR_CODES.MAX_PLAYERS_REACHED)
  }

  const newPlayer: Player = {
    id: generatePlayerId(),
    name: playerName,
    scores: {},
  }

  const updatedPlayers = [...room.players, newPlayer]

  await updateDoc(roomRef, {
    players: updatedPlayers,
    updatedAt: Date.now(),
  })
}

const generatePlayerId = (): string => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8)
  return `player_${timestamp}_${randomPart}`
}

const deleteRoom = async (roomId: string) => {
  const roomRef = getGameRoomDocumentReference(roomId)
  await deleteDoc(roomRef)
}

export const roomActions = {
  createRoom,
  joinRoom,
  deleteRoom,
}
