import {
  UPPER_BONUS_THRESHOLD,
  UPPER_BONUS_SCORE,
  UPPER_SECTION_CATEGORIES,
  LOWER_SECTION_CATEGORIES,
} from '@/constants/game'
import { DiceHand, DiceValue, GameRoom, Player, ScoreCard, ScoreCategory } from '@/types/game'

// 주사위 점수 계산 함수들
export class YachtDiceCalculator {
  // 상위 섹션 점수 계산
  static calculateUpperSection(diceCount: number, target: DiceValue): number {
    return diceCount * target
  }

  // 3 of a Kind 계산
  static calculateThreeOfAKind(diceHand: DiceHand): number {
    const counts = YachtDiceCalculator.getDiceCounts(diceHand)
    const hasThreeOfAKind = Object.values(counts).some(count => count >= 3)
    return hasThreeOfAKind ? diceHand.reduce((sum, die) => sum + die, 0) : 0
  }

  // 4 of a Kind 계산
  static calculateFourOfAKind(diceHand: DiceHand): number {
    const counts = YachtDiceCalculator.getDiceCounts(diceHand)
    const hasFourOfAKind = Object.values(counts).some(count => count >= 4)
    return hasFourOfAKind ? diceHand.reduce((sum, die) => sum + die, 0) : 0
  }

  // Full House 계산
  static calculateFullHouse(diceHand: DiceHand): number {
    const counts = YachtDiceCalculator.getDiceCounts(diceHand)
    const countValues = Object.values(counts).sort((a, b) => b - a)
    const hasFullHouse = countValues[0] === 3 && countValues[1] === 2

    if (!hasFullHouse) return 0

    return diceHand.reduce((sum, die) => sum + die, 0)
  }

  // Small Straight 계산 (15점 고정)
  // static calculateSmallStraight(dice: number[]): number {
  //   const uniqueDice = [...new Set(dice)].sort()
  //   const hasSmallStraight = YachtDiceCalculator.hasConsecutive(uniqueDice, 4)
  //   return hasSmallStraight ? FIXED_SCORE_CATEGORIES.smallStraight : 0
  // }

  // Large Straight 계산 (30점 고정)
  // static calculateLargeStraight(dice: number[]): number {
  //   const uniqueDice = [...new Set(dice)].sort()
  //   const hasLargeStraight = YachtDiceCalculator.hasConsecutive(uniqueDice, 5)
  //   return hasLargeStraight ? FIXED_SCORE_CATEGORIES.largeStraight : 0
  // }

  // Yacht 계산 (50점 고정)
  // static calculateYacht(dice: number[]): number {
  //   const firstDie = dice[0]
  //   const isYacht = dice.every(die => die === firstDie)
  //   return isYacht ? FIXED_SCORE_CATEGORIES.yacht : 0
  // }

  // Chance 계산 (모든 주사위 합)
  static calculateChance(dice: number[]): number {
    return dice.reduce((sum, die) => sum + die, 0)
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
    const upperTotal = YachtDiceCalculator.calculateUpperSectionTotal(scores)
    return upperTotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_SCORE : 0
  }

  // 총점 계산
  static calculateTotalScore(scores: ScoreCard): number {
    const upperTotal = YachtDiceCalculator.calculateUpperSectionTotal(scores)
    const lowerTotal = YachtDiceCalculator.calculateLowerSectionTotal(scores)
    const bonus = YachtDiceCalculator.calculateUpperBonus(scores)
    return upperTotal + lowerTotal + bonus
  }

  // 유틸리티 함수들
  private static getDiceCounts(dice: DiceHand): Record<DiceValue, number> {
    return dice.reduce<Record<DiceValue, number>>(
      (counts, die) => {
        counts[die] = (counts[die] || 0) + 1
        return counts
      },
      {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      },
    )
  }

  // private static hasConsecutive(sortedArray: number[], length: number): boolean {
  //   for (let i = 0; i <= sortedArray.length - length; i++) {
  //     let consecutive = true
  //     for (let j = 1; j < length; j++) {
  //       if (sortedArray[i + j] !== sortedArray[i] + j) {
  //         consecutive = false
  //         break
  //       }
  //     }
  //     if (consecutive) return true
  //   }
  //   return false
  // }
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
