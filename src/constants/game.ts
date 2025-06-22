import { ScoreCategory } from '@/types/game'

// Yacht Dice 게임 상수들

// 게임 라운드 수
export const MAX_ROUNDS = 12

// 상위 섹션 보너스 기준 점수
export const UPPER_BONUS_THRESHOLD = 63
export const UPPER_BONUS_SCORE = 35

// 상위 섹션 카테고리
export const UPPER_SECTION_CATEGORIES = [
  'ace',
  'dual',
  'triple',
  'quad',
  'penta',
  'hexa',
] as const satisfies ScoreCategory[]

// 하위 섹션 카테고리
export const LOWER_SECTION_CATEGORIES = [
  'poker',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht',
  'choice',
] as const satisfies ScoreCategory[]

// 점수 카테고리 순서
export const SCORE_CATEGORIES: ScoreCategory[] = [...UPPER_SECTION_CATEGORIES, ...LOWER_SECTION_CATEGORIES]

// 고정 점수 카테고리
export const FIXED_SCORE_CATEGORIES = {
  fullHouse: 25,
  smallStraight: 15,
  largeStraight: 30,
  yacht: 50,
} as const

export const UPPER_SECTION_DICE_COUNT = {
  ace: 1,
  dual: 2,
  triple: 3,
  quad: 4,
  penta: 5,
  hexa: 6,
} as const
