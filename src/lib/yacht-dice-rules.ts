import {
  UPPER_BONUS_THRESHOLD,
  UPPER_BONUS_SCORE,
  UPPER_SECTION_CATEGORIES,
  LOWER_SECTION_CATEGORIES,
  FIXED_SCORE_CATEGORIES,
} from '@/constants/game'
import { GameRoom, Player, ScoreCard, ScoreCategory, ExtendedRules } from '@/types/game'

// 주사위 점수 계산 함수들
export class YachtDiceCalculator {
  // 상위 섹션 점수 계산
  static calculateUpperSection(dice: number[], target: number): number {
    return dice.filter(die => die === target).reduce((sum, die) => sum + die, 0)
  }

  // 3 of a Kind 계산
  static calculateThreeOfAKind(dice: number[]): number {
    const counts = this.getDiceCounts(dice)
    const hasThreeOfAKind = Object.values(counts).some(count => count >= 3)
    return hasThreeOfAKind ? dice.reduce((sum, die) => sum + die, 0) : 0
  }

  // Poker 계산
  static calculateFourOfAKind(dice: number[]): number {
    const counts = this.getDiceCounts(dice)
    const poker = Object.values(counts).some(count => count >= 4)
    return poker ? dice.reduce((sum, die) => sum + die, 0) : 0
  }

  // Full House 계산 (확장 룰 지원)
  static calculateFullHouse({ dice, fixedScore }: { dice: number[]; fixedScore: boolean }): number {
    const counts = this.getDiceCounts(dice)
    const countValues = Object.values(counts).sort((a, b) => b - a)
    const hasFullHouse = countValues[0] === 3 && countValues[1] === 2

    if (!hasFullHouse) return 0

    // 확장 룰: Full House 고정 점수 사용
    if (fixedScore) {
      return FIXED_SCORE_CATEGORIES.fullHouse
    }

    // 기본 룰: 주사위 합계
    return dice.reduce((sum, die) => sum + die, 0)
  }

  // Small Straight 계산 (15점 고정)
  static calculateSmallStraight(dice: number[]): number {
    const uniqueDice = [...new Set(dice)].sort()
    const hasSmallStraight = this.hasConsecutive(uniqueDice, 4)
    return hasSmallStraight ? FIXED_SCORE_CATEGORIES.smallStraight : 0
  }

  // Large Straight 계산 (30점 고정)
  static calculateLargeStraight(dice: number[]): number {
    const uniqueDice = [...new Set(dice)].sort()
    const hasLargeStraight = this.hasConsecutive(uniqueDice, 5)
    return hasLargeStraight ? FIXED_SCORE_CATEGORIES.largeStraight : 0
  }

  // Yacht 계산 (50점 고정)
  static calculateYacht(dice: number[]): number {
    const firstDie = dice[0]
    const isYacht = dice.every(die => die === firstDie)
    return isYacht ? FIXED_SCORE_CATEGORIES.yacht : 0
  }

  // Choice 계산 (모든 주사위 합)
  static calculateChance(dice: number[]): number {
    return dice.reduce((sum, die) => sum + die, 0)
  }

  // 메인 점수 계산 함수 (확장 룰 지원)
  static calculateScore({
    category,
    dice,
    extendedRules,
  }: {
    category: ScoreCategory
    dice: number[]
    extendedRules: ExtendedRules
  }): number {
    switch (category) {
      case 'ace':
        return this.calculateUpperSection(dice, 1)
      case 'dual':
        return this.calculateUpperSection(dice, 2)
      case 'triple':
        return this.calculateUpperSection(dice, 3)
      case 'quad':
        return this.calculateUpperSection(dice, 4)
      case 'penta':
        return this.calculateUpperSection(dice, 5)
      case 'hexa':
        return this.calculateUpperSection(dice, 6)
      case 'threeOfAKind':
        return this.calculateThreeOfAKind(dice)
      case 'fourOfAKind':
        return this.calculateFourOfAKind(dice)
      case 'fullHouse':
        return this.calculateFullHouse({ dice, fixedScore: extendedRules.fullHouseFixedScore })
      case 'smallStraight':
        return this.calculateSmallStraight(dice)
      case 'largeStraight':
        return this.calculateLargeStraight(dice)
      case 'yacht':
        return this.calculateYacht(dice)
      case 'chance':
        return this.calculateChance(dice)
      default:
        return 0
    }
  }

  // 상위 섹션 총점 계산
  static calculateUpperSectionTotal(scores: ScoreCard): number {
    return UPPER_SECTION_CATEGORIES.reduce((sum, key) => {
      return sum + (scores[key] || 0)
    }, 0)
  }

  // 하위 섹션 총점 계산
  static calculateLowerSectionTotal(scores: ScoreCard): number {
    return LOWER_SECTION_CATEGORIES.reduce((sum, key) => {
      return sum + (scores[key] || 0)
    }, 0)
  }

  // 보너스 점수 계산 (상위 섹션 합이 63 이상이면 35점)
  static calculateUpperBonus(scores: ScoreCard): number {
    const upperTotal = this.calculateUpperSectionTotal(scores)
    return upperTotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_SCORE : 0
  }

  // 총점 계산
  static calculateTotalScore(scores: ScoreCard): number {
    const upperTotal = this.calculateUpperSectionTotal(scores)
    const lowerTotal = this.calculateLowerSectionTotal(scores)
    const bonus = this.calculateUpperBonus(scores)
    return upperTotal + lowerTotal + bonus
  }

  // 유틸리티 함수들
  private static getDiceCounts(dice: number[]): Record<number, number> {
    return dice.reduce(
      (counts, die) => {
        counts[die] = (counts[die] || 0) + 1
        return counts
      },
      {} as Record<number, number>,
    )
  }

  private static hasConsecutive(sortedArray: number[], length: number): boolean {
    for (let i = 0; i <= sortedArray.length - length; i++) {
      let consecutive = true
      for (let j = 1; j < length; j++) {
        if (sortedArray[i + j] !== sortedArray[i] + j) {
          consecutive = false
          break
        }
      }
      if (consecutive) return true
    }
    return false
  }
}

// 카테고리 한글 이름 매핑
export const CATEGORY_NAMES: Record<ScoreCategory, string> = {
  ace: 'Ace',
  dual: 'Dual',
  triple: 'Triple',
  quad: 'Quad',
  penta: 'Penta',
  hexa: 'Hexa',
  threeOfAKind: '3 of a Kind',
  fourOfAKind: '4 of a Kind',
  fullHouse: 'Full House',
  smallStraight: 'Small Straight',
  largeStraight: 'Large Straight',
  yacht: 'Yacht',
  chance: 'Chance',
}

export const UPPER_SECTION_DICE_COUNT = {
  ones: 1,
}

export const getPlayerRankings = (gameRoom: GameRoom): { player: Player; ranking: number; totalScore: number }[] => {
  const playersWithScores = gameRoom.players
    .map(player => ({
      player,
      totalScore: YachtDiceCalculator.calculateTotalScore(player.scores),
    }))
    .sort((a, b) => b.totalScore - a.totalScore)

  // 동점자 처리를 위한 순위 계산
  const playersWithRankings: { player: Player; ranking: number; totalScore: number }[] = []
  let currentRanking = 1

  for (let i = 0; i < playersWithScores.length; i++) {
    const currentPlayer = playersWithScores[i]

    // 이전 플레이어와 점수가 다르면 순위 업데이트
    if (i > 0 && playersWithScores[i - 1].totalScore !== currentPlayer.totalScore) {
      currentRanking = i + 1
    }

    playersWithRankings.push({
      player: currentPlayer.player,
      ranking: currentRanking,
      totalScore: currentPlayer.totalScore,
    })
  }

  return playersWithRankings
}

export const getTiedPlayersInfo = (
  gameRoom: GameRoom,
  targetRanking: number,
): { player: Player; totalScore: number }[] => {
  const rankings = getPlayerRankings(gameRoom)
  return rankings.filter(p => p.ranking === targetRanking).map(p => ({ player: p.player, totalScore: p.totalScore }))
}
