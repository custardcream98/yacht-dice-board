// Yacht Dice 게임 타입 정의

export interface Player {
  id: string
  name: string
  scores: ScoreCard
}

export interface ScoreCard {
  // 상위 섹션 (1-6)
  ace?: number
  choice?: number
  dual?: number
  fullHouse?: number
  hexa?: number
  largeStraight?: number

  penta?: number
  // 하위 섹션
  poker?: number
  quad?: number
  smallStraight?: number
  triple?: number
  yacht?: number
}

export interface GameRoom {
  createdAt: number
  currentPlayerIndex: number
  currentRound: number
  id: string
  maxRounds: number
  name: string
  players: Player[]
  status: 'finished' | 'playing' | 'waiting'
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
  isValid: boolean
  score: number
}
