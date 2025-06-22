// Yacht Dice 게임 타입 정의

export interface Player {
  id: string
  name: string
  scores: ScoreCard
}

export interface ScoreCard {
  // 상위 섹션 (1-6)
  ones?: number
  twos?: number
  threes?: number
  fours?: number
  fives?: number
  sixes?: number

  // 하위 섹션
  fourOfAKind?: number
  fullHouse?: number
  smallStraight?: number
  largeStraight?: number
  yacht?: number
  choice?: number
}

export interface GameRoom {
  id: string
  name: string
  players: Player[]
  currentPlayerIndex: number
  currentRound: number
  maxRounds: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: number
  updatedAt: number
}

export interface DiceRoll {
  dice: number[] // 5개 주사위 값
  rollCount: number // 현재 롤 횟수 (최대 3회)
}

export type ScoreCategory = keyof ScoreCard

// 점수 계산 결과
export interface ScoreCalculation {
  category: ScoreCategory
  score: number
  isValid: boolean
}
