import { doc, DocumentReference } from 'firebase/firestore'

import { db } from '@/lib/firebase/client/firebase'
import { GameRoom } from '@/types/game'

export const getGameRoomDocumentReference = (roomId: string) =>
  doc(db, 'gameRooms', roomId) as DocumentReference<GameRoom>
