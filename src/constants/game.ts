import { ScoreCategory } from '@/types/game'

// Yacht Dice 게임 상수들

// 게임 라운드 수
export const MAX_ROUNDS = 12

// 상위 섹션 보너스 기준 점수
export const UPPER_BONUS_THRESHOLD = 63
export const UPPER_BONUS_SCORE = 35

// 점수 카테고리 순서
export const SCORE_CATEGORIES: ScoreCategory[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht',
  'choice',
]

// 상위 섹션 카테고리
export const UPPER_SECTION_CATEGORIES: ScoreCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']

// 하위 섹션 카테고리
export const LOWER_SECTION_CATEGORIES: ScoreCategory[] = [
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht',
  'choice',
]

// 고정 점수 카테고리
export const FIXED_SCORE_CATEGORIES = {
  fullHouse: 25,
  smallStraight: 15,
  largeStraight: 30,
  yacht: 50,
} as const
