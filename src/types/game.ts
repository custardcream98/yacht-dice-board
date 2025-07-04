export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6

export type DiceHand = [DiceValue, DiceValue, DiceValue, DiceValue, DiceValue]

export interface Player {
  id: string
  name: string
  scores: ScoreCard
}

// 게임 확장 룰 설정
export interface ExtendedRules {
  // 3 of a Kind 족보 사용 여부
  enableThreeOfAKind: boolean
  // Full House를 고정 점수(25점)로 할지 여부
  fullHouseFixedScore: boolean
}

// 기본 게임 룰
export const DEFAULT_EXTENDED_RULES: ExtendedRules = {
  fullHouseFixedScore: false,
  enableThreeOfAKind: false,
}

export interface ScoreCard {
  ace?: number
  chance?: number
  dual?: number
  fourOfAKind?: number
  fullHouse?: number
  hexa?: number
  largeStraight?: number
  penta?: number
  quad?: number
  smallStraight?: number
  threeOfAKind?: number
  triple?: number
  yacht?: number
}

export interface GameRoom {
  createdAt: number
  currentPlayerIndex: number
  currentRound: number
  extendedRules: ExtendedRules
  id: string
  maxRounds: number
  name: string
  players: Player[]
  status: 'finished' | 'playing' | 'waiting'
  updatedAt: number
}

export type ScoreCategory = keyof ScoreCard
