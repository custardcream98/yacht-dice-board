import { Calculator, Lock, Target, Plus, Minus, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'
import React, { useState, useCallback, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ValueConsumer } from '@/components/ValueConsumer'
import {
  UPPER_SECTION_CATEGORIES,
  LOWER_SECTION_CATEGORIES,
  UPPER_SECTION_DICE_COUNT,
  FIXED_SCORE_CATEGORIES,
} from '@/constants/game'
import { useAsyncHandler } from '@/hooks/useAsyncHandler'
import { FirebaseCustomError } from '@/lib/firebase/error'
import {
  gameActions,
  isSubmitScoreErrorCode,
  SUBMIT_SCORE_ERROR_CODES,
  isUpdateScoreErrorCode,
  UPDATE_SCORE_ERROR_CODES,
} from '@/lib/firebase/game'
import { exhaustiveCheck } from '@/lib/types'
import { cn } from '@/lib/utils'
import { YachtDiceCalculator, CATEGORY_NAMES } from '@/lib/yacht-dice-rules'
import { ScoreCategory, Player, ExtendedRules, DiceValue, DiceHand } from '@/types/game'

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6] as const
const DiceIcon = ({ value, className }: { value: DiceValue; className?: string }) => {
  const Icon = DICE_ICONS[value - 1]
  return <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', className)} />
}

interface ScoreInputProps {
  extendedRules: ExtendedRules
  isMyTurn: boolean
  myPlayer: Player
  roomId: string
}

const SUBMIT_SCORE_ERROR_MESSAGES = {
  [SUBMIT_SCORE_ERROR_CODES.ROOM_NOT_FOUND]: '존재하지 않는 방입니다.',
  [SUBMIT_SCORE_ERROR_CODES.PLAYER_NOT_FOUND]: '플레이어를 찾을 수 없습니다.',
  [SUBMIT_SCORE_ERROR_CODES.CATEGORY_ALREADY_SCORED]: '이미 점수가 있습니다.',
} as const

const UPDATE_SCORE_ERROR_MESSAGES = {
  [UPDATE_SCORE_ERROR_CODES.ROOM_NOT_FOUND]: '존재하지 않는 방입니다.',
  [UPDATE_SCORE_ERROR_CODES.PLAYER_NOT_FOUND]: '플레이어를 찾을 수 없습니다.',
} as const

const EditModeIndicator = ({ isScored, currentScore }: { isScored: boolean; currentScore?: number }) => {
  if (!isScored) return null

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
        <div className="mb-1 text-sm font-medium text-orange-700">점수 수정 모드</div>
        <div className="text-xs text-orange-600">현재 점수: {currentScore}점</div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <div className="mb-1 flex items-center justify-center gap-1 text-sm font-medium text-red-700">⚠️ 주의사항</div>
        <div className="text-xs leading-relaxed text-red-600">
          <div className="mb-1">• 요트 다이스는 원래 점수 수정이 불가능한 게임입니다</div>
          <div>• 실수로 점수를 잘못 입력했을 때만 사용해주세요</div>
        </div>
      </div>
    </div>
  )
}

export function ScoreInput({ extendedRules, myPlayer, isMyTurn, roomId }: ScoreInputProps) {
  const { handleAsync: submitScore, isPending: isSubmitScorePending } = useAsyncHandler(gameActions.submitScore)
  const { handleAsync: updateScore, isPending: isUpdateScorePending } = useAsyncHandler(gameActions.updateScore)

  const isScoreActionPending = isSubmitScorePending || isUpdateScorePending

  const handleScoreSubmit = async (category: ScoreCategory, score: number) => {
    const isScored = myPlayer?.scores[category] !== undefined

    try {
      if (isScored) {
        await updateScore({ roomId, playerId: myPlayer.id, category, score })
      } else {
        await submitScore({ roomId, playerId: myPlayer.id, category, score })
      }
    } catch (err) {
      if (err instanceof FirebaseCustomError) {
        if (isSubmitScoreErrorCode(err.code)) {
          alert(SUBMIT_SCORE_ERROR_MESSAGES[err.code])
        } else if (isUpdateScoreErrorCode(err.code)) {
          alert(UPDATE_SCORE_ERROR_MESSAGES[err.code])
        } else {
          alert('점수 입력에 실패했습니다.')
        }
      } else {
        alert('점수 입력에 실패했습니다.')
      }
    }
  }

  const visibleLowerCategories = useMemo(
    () =>
      LOWER_SECTION_CATEGORIES.filter(category => {
        if (category === 'threeOfAKind') {
          return extendedRules.enableThreeOfAKind
        }
        return true
      }),
    [extendedRules],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          점수 입력
          {!isMyTurn && (
            <Badge className="ml-auto text-xs" variant="secondary">
              <Lock className="mr-1 h-3 w-3" />
              대기 중
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상위 섹션 */}
        <div>
          <h3 className="mb-3 font-bold text-blue-700">상위 섹션</h3>
          <div className="grid grid-cols-2 gap-2">
            {UPPER_SECTION_CATEGORIES.map(category => {
              const score = myPlayer?.scores[category]
              const isScored = score !== undefined
              const isWaitingTurn = !isMyTurn

              return (
                <UpperSectionDialog
                  category={category}
                  currentScore={score}
                  isScored={isScored}
                  key={category}
                  onScoreSubmit={handleScoreSubmit}
                >
                  <Button
                    className={cn(
                      'relative flex h-16 flex-col items-center justify-center overflow-hidden p-2',
                      isWaitingTurn
                        ? 'cursor-not-allowed opacity-50'
                        : isScored
                          ? 'transform border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 shadow-md hover:from-blue-200 hover:to-blue-300'
                          : 'hover:border-blue-300 hover:bg-blue-50',
                    )}
                    disabled={isWaitingTurn || isScoreActionPending}
                    variant={isScored ? 'secondary' : 'outline'}
                  >
                    {isScored && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/40 to-blue-100/40" />
                    )}
                    <div className="relative z-10 mb-1 flex items-center gap-1">
                      <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
                      <span className={cn('text-xs font-bold', isScored && 'text-blue-700')}>
                        {CATEGORY_NAMES[category]}
                      </span>
                    </div>
                    <div className={cn('relative z-10 font-bold', isScored ? 'text-xl text-blue-800' : 'text-lg')}>
                      {isScored ? `${score}점` : '-'}
                    </div>
                    {isWaitingTurn && (
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-100/80">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </Button>
                </UpperSectionDialog>
              )
            })}
          </div>
        </div>

        {/* 하위 섹션 */}
        <div>
          <h3 className="mb-3 font-bold text-green-700">하위 섹션</h3>
          <div className="grid grid-cols-1 gap-2">
            {visibleLowerCategories.map(category => {
              const score = myPlayer?.scores[category]
              const isScored = score !== undefined
              const isWaitingTurn = !isMyTurn

              const isExtendedRule =
                (category === 'threeOfAKind' && extendedRules.enableThreeOfAKind) ||
                (category === 'fullHouse' && extendedRules.fullHouseFixedScore)

              return (
                <LowerSectionDialog
                  category={category}
                  currentScore={score}
                  extendedRules={extendedRules}
                  isScored={isScored}
                  key={category}
                  onScoreSubmit={handleScoreSubmit}
                >
                  <Button
                    className={cn(
                      'relative flex h-16 items-center justify-between overflow-hidden p-4',
                      isWaitingTurn
                        ? 'cursor-not-allowed opacity-50'
                        : isScored
                          ? 'transform border-green-300 bg-gradient-to-br from-green-100 to-green-200 shadow-md hover:from-green-200 hover:to-green-300'
                          : 'hover:border-green-300 hover:bg-green-50',
                    )}
                    disabled={isWaitingTurn || isScoreActionPending}
                    variant={isScored ? 'secondary' : 'outline'}
                  >
                    {isScored && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/40 to-green-100/40" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className={cn('relative z-10 font-bold', isScored && 'text-green-700')}>
                        {CATEGORY_NAMES[category]}
                      </span>
                      {/* 확장 룰 표시 */}
                      {isExtendedRule && (
                        <Badge className="bg-orange-100 text-xs text-orange-800" variant="outline">
                          확장
                        </Badge>
                      )}
                    </div>
                    <span className={cn('relative z-10 font-bold', isScored ? 'text-xl text-green-800' : 'text-lg')}>
                      {isScored ? `${score}점` : '-'}
                    </span>
                    {isWaitingTurn && (
                      <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-100/80">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </Button>
                </LowerSectionDialog>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const UpperSectionDialog = ({
  category,
  onScoreSubmit,
  currentScore,
  isScored,
  children,
}: React.PropsWithChildren<{
  category: (typeof UPPER_SECTION_CATEGORIES)[number]
  onScoreSubmit: (category: ScoreCategory, score: number) => void
  currentScore?: number
  isScored: boolean
}>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
            {CATEGORY_NAMES[category]}
          </DialogTitle>
        </DialogHeader>
        <UpperSectionInput
          category={category}
          currentScore={currentScore}
          isScored={isScored}
          onScoreSubmit={score => {
            onScoreSubmit(category, score)
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

const DICE_VALUE_TO_JOSA = {
  1: '이',
  2: '가',
  3: '이',
  4: '가',
  5: '가',
  6: '이',
} as const satisfies Record<DiceValue, string>
const UpperSectionInput = ({
  category,
  onScoreSubmit,
  currentScore,
  isScored,
}: {
  category: (typeof UPPER_SECTION_CATEGORIES)[number]
  onScoreSubmit: (score: number) => void
  currentScore?: number
  isScored: boolean
}) => {
  // 현재 점수가 있으면 역산하여 초기 주사위 개수 설정
  const initialDiceCount = useMemo(() => {
    if (isScored && currentScore !== undefined) {
      const diceValue = UPPER_SECTION_DICE_COUNT[category]
      return Math.floor(currentScore / diceValue)
    }
    return 0
  }, [isScored, currentScore, category])

  const [diceCount, setDiceCount] = useState(initialDiceCount)

  const increment = () => setDiceCount(prev => prev + 1)
  const decrement = () => setDiceCount(prev => prev - 1)

  const calculatedScore = useMemo(
    () => YachtDiceCalculator.calculateUpperSection(diceCount, UPPER_SECTION_DICE_COUNT[category]),
    [diceCount, category],
  )

  const diceValue = UPPER_SECTION_DICE_COUNT[category]

  return (
    <div className="space-y-6">
      <EditModeIndicator currentScore={currentScore} isScored={isScored} />

      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <div className="mb-1 text-sm font-medium text-gray-700">
          {diceValue} {DICE_VALUE_TO_JOSA[diceValue]} 나온 주사위 개수를 입력하세요
        </div>
        <div className="text-xs text-gray-500">최대 5개까지 입력 가능합니다</div>
      </div>

      {/* 주사위 개수 입력 */}
      <div className="flex items-center justify-center gap-4">
        <Button
          className="h-12 w-12 rounded-full"
          disabled={diceCount <= 0}
          onClick={decrement}
          size="sm"
          variant="outline"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-blue-300 bg-blue-50 text-2xl font-bold text-blue-700">
          {diceCount}
        </div>

        <Button
          className="h-12 w-12 rounded-full"
          disabled={diceCount >= 5}
          onClick={increment}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 계산된 점수 표시 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
        <div className="mb-1 text-sm font-medium text-blue-600">계산된 점수</div>
        <div className="text-3xl font-bold text-blue-700">{calculatedScore}점</div>
        <div className="mt-1 text-xs text-blue-500">
          {diceValue} × {diceCount} = {calculatedScore}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex w-full gap-2">
        <Button className="xs:text-lg h-12 text-base font-bold" onClick={() => onScoreSubmit(0)} variant="outline">
          포기 (0점)
        </Button>
        <Button
          className="xs:text-lg h-12 flex-1 text-base font-bold"
          disabled={diceCount === 0}
          onClick={() => onScoreSubmit(calculatedScore)}
        >
          <Target className="mr-1 h-5 w-5" />
          {isScored ? '수정하기' : '제출하기'} ({calculatedScore}점)
        </Button>
      </div>
    </div>
  )
}

const THREE_OF_A_KIND_INFO = {
  description: '같은 숫자 3개',
} as const satisfies HandInfo

const FOUR_OF_A_KIND_INFO = {
  description: '같은 숫자 4개',
} as const satisfies HandInfo

const FULL_HOUSE_INFO = {
  description: '같은 숫자 3개와 같은 숫자 2개',
  examples: [[1, 1, 1, 2, 2]],
  score: FIXED_SCORE_CATEGORIES.fullHouse,
} as const satisfies YesNoInputInfo

const SMALL_STRAIGHT_INFO = {
  description: '연속된 4개의 숫자',
  examples: [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ],
  score: FIXED_SCORE_CATEGORIES.smallStraight,
} as const satisfies YesNoInputInfo

const LARGE_STRAIGHT_INFO = {
  description: '연속된 5개의 숫자',
  examples: [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
  ],
  score: FIXED_SCORE_CATEGORIES.largeStraight,
} as const satisfies YesNoInputInfo

const CHANCE_INFO = {
  description: '모든 주사위의 합이 점수가 됩니다',
} as const satisfies HandInfo

const LowerSectionDialog = ({
  category,
  extendedRules,
  onScoreSubmit,
  currentScore,
  isScored,
  children,
}: React.PropsWithChildren<{
  category: (typeof LOWER_SECTION_CATEGORIES)[number]
  extendedRules: ExtendedRules
  onScoreSubmit: (category: ScoreCategory, score: number) => void
  currentScore?: number
  isScored: boolean
}>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog key={category} onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {CATEGORY_NAMES[category]}
            {/* 확장 룰 표시 */}
            {category === 'threeOfAKind' && extendedRules.enableThreeOfAKind && (
              <Badge className="bg-orange-100 text-xs text-orange-800" variant="outline">
                확장 룰
              </Badge>
            )}
            {category === 'fullHouse' && extendedRules.fullHouseFixedScore && (
              <Badge className="bg-orange-100 text-xs text-orange-800" variant="outline">
                고정 25점
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <ValueConsumer value={category}>
          {value => {
            const handleSubmit = (score: number) => {
              onScoreSubmit(value, score)
              setIsOpen(false)
            }

            switch (value) {
              case 'threeOfAKind':
                return (
                  <DiceInput
                    {...THREE_OF_A_KIND_INFO}
                    calculateScore={YachtDiceCalculator.calculateThreeOfAKind}
                    currentScore={currentScore}
                    isScored={isScored}
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'fourOfAKind':
                return (
                  <DiceInput
                    {...FOUR_OF_A_KIND_INFO}
                    calculateScore={YachtDiceCalculator.calculateFourOfAKind}
                    currentScore={currentScore}
                    isScored={isScored}
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'fullHouse': {
                if (extendedRules.fullHouseFixedScore) {
                  return (
                    <YesNoInput
                      {...FULL_HOUSE_INFO}
                      currentScore={currentScore}
                      isScored={isScored}
                      onScoreSubmit={handleSubmit}
                    />
                  )
                } else {
                  return (
                    <DiceInput
                      calculateScore={YachtDiceCalculator.calculateFullHouse}
                      currentScore={currentScore}
                      description={FULL_HOUSE_INFO.description}
                      isScored={isScored}
                      onScoreSubmit={handleSubmit}
                    />
                  )
                }
              }
              case 'smallStraight':
                return (
                  <YesNoInput
                    {...SMALL_STRAIGHT_INFO}
                    currentScore={currentScore}
                    isScored={isScored}
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'largeStraight':
                return (
                  <YesNoInput
                    {...LARGE_STRAIGHT_INFO}
                    currentScore={currentScore}
                    isScored={isScored}
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'yacht':
                return <YachtYesNoInput currentScore={currentScore} isScored={isScored} onScoreSubmit={handleSubmit} />
              case 'chance':
                return (
                  <DiceInput
                    {...CHANCE_INFO}
                    calculateScore={YachtDiceCalculator.calculateChance}
                    currentScore={currentScore}
                    isScored={isScored}
                    onScoreSubmit={handleSubmit}
                  />
                )

              default:
                exhaustiveCheck(value)
            }
          }}
        </ValueConsumer>
      </DialogContent>
    </Dialog>
  )
}

type HandInfo = {
  description: string
}

type YesNoInputInfo = HandInfo & {
  examples?: DiceValue[][]
  score: number
}
const YesNoInput = ({
  description,
  examples,
  score,
  onScoreSubmit,
  currentScore,
  isScored,
}: YesNoInputInfo & {
  onScoreSubmit: (score: number) => void
  currentScore?: number
  isScored: boolean
}) => {
  return (
    <div className="space-y-6">
      <EditModeIndicator currentScore={currentScore} isScored={isScored} />

      {/* 족보 설명 */}
      <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
        <p className="text-center font-bold text-green-700">{description}</p>
        {examples && (
          <div className="mt-3 space-y-1">
            <div className="text-sm font-medium text-green-600">예시:</div>
            {examples.map((example, idx) => (
              <div
                className="flex items-center justify-center gap-1 rounded bg-white/50 px-2 py-1 text-green-600"
                key={idx}
              >
                {example.map((dice, index) => (
                  <DiceIcon key={index} value={dice} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 질문 */}
      <div className="text-center">
        <p className="mb-4 text-lg font-medium text-gray-800">위 조건에 맞는 주사위가 나왔나요?</p>
      </div>

      {/* 버튼 */}
      <div className="flex w-full gap-3">
        <Button
          className="xs:text-lg h-14 bg-gray-100 text-base font-bold text-gray-700 hover:bg-gray-200"
          onClick={() => onScoreSubmit(0)}
          variant="outline"
        >
          포기 (0점)
        </Button>
        <Button
          className="xs:text-lg h-14 flex-1 bg-green-600 text-base font-bold hover:bg-green-700"
          onClick={() => onScoreSubmit(score)}
        >
          <Target className="mr-2 h-5 w-5" />
          {isScored ? '수정하기' : '네!'} ({score}점)
        </Button>
      </div>
    </div>
  )
}

const YachtYesNoInput = ({
  onScoreSubmit,
  currentScore,
  isScored,
}: {
  onScoreSubmit: (score: number) => void
  currentScore?: number
  isScored: boolean
}) => {
  return (
    <div className="space-y-6">
      <EditModeIndicator currentScore={currentScore} isScored={isScored} />

      {/* 족보 설명 */}
      <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
        <div className="mb-3 text-center text-xl font-bold text-orange-800">요트</div>
        <p className="text-center text-orange-700">같은 숫자 5개</p>
      </div>

      {/* 축하 질문 */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
        <p className="mb-2 text-lg font-medium text-gray-800">요트가 나왔나요?</p>
        <p className="text-sm text-gray-600">게임의 최고 점수입니다!</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button
          className="xs:text-lg h-14 flex-1 bg-gray-100 text-base font-bold text-gray-700 hover:bg-gray-200"
          onClick={() => onScoreSubmit(0)}
          variant="outline"
        >
          포기 (0점)
        </Button>
        <Button
          className="xs:text-lg h-14 flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-base font-bold text-white shadow-lg hover:from-yellow-600 hover:to-orange-600"
          onClick={() => onScoreSubmit(FIXED_SCORE_CATEGORIES.yacht)}
        >
          <Target className="mr-2 h-5 w-5" />
          🎉 {isScored ? '수정하기' : '네!'} ({FIXED_SCORE_CATEGORIES.yacht}점)
        </Button>
      </div>
    </div>
  )
}

const INITIAL_DICE = [1, 1, 1, 1, 1] as const satisfies DiceHand
const ALL_DICE_VALUES = [1, 2, 3, 4, 5, 6] as const satisfies DiceValue[]
function DiceInput({
  description,
  calculateScore,
  onScoreSubmit,
  currentScore,
  isScored,
}: HandInfo & {
  calculateScore: (dice: DiceHand) => number
  onScoreSubmit: (score: number) => void
  currentScore?: number
  isScored: boolean
}) {
  const [dice, setDice] = useState<DiceHand>(INITIAL_DICE)

  const calculatedScore = useMemo(() => calculateScore(dice), [dice, calculateScore])

  const handleDiceClick = useCallback((index: number, value: DiceValue) => {
    setDice(prevDice => {
      const newDice: DiceHand = [...prevDice]
      newDice[index] = value
      return newDice
    })
  }, [])

  return (
    <div className="space-y-4">
      <EditModeIndicator currentScore={currentScore} isScored={isScored} />

      {/* 족보 설명 */}
      <div className="rounded-lg bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">{description}</div>

      <div className="-mt-2 space-y-4">
        {/* 주사위 입력 */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {dice.map((value, index) => (
              <div className="flex flex-col items-center gap-1" key={index}>
                <div className="text-xs text-gray-500">{index + 1}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded border border-blue-300 bg-blue-100">
                  <DiceIcon value={value} />
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto w-fit max-w-xs rounded-lg border border-gray-200 bg-gray-50 p-2">
            <div className="grid grid-cols-[10px_repeat(6,1fr)] items-center gap-[6px]">
              {/* 주사위 선택 행들 */}
              {dice.map((selectedValue, diceIndex) => (
                <React.Fragment key={diceIndex}>
                  <div className="text-center text-xs font-medium text-gray-600">{diceIndex + 1}</div>
                  {ALL_DICE_VALUES.map(diceValue => (
                    <button
                      className={cn(
                        'flex aspect-square h-full w-full items-center justify-center rounded-lg border p-1 transition-all duration-100',
                        'active:scale-95',
                        selectedValue === diceValue
                          ? 'border-blue-600 bg-blue-500 text-white shadow-sm'
                          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50',
                      )}
                      key={`${diceIndex}${diceValue}`}
                      onClick={() => handleDiceClick(diceIndex, diceValue)}
                      type="button"
                    >
                      <DiceIcon className="aspect-square h-full max-h-6 w-full" value={diceValue} />
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 계산된 점수 표시 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
          <div className="mb-1 text-sm font-medium text-blue-600">계산된 점수</div>
          <div className="text-3xl font-bold text-blue-700">{calculatedScore}점</div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex w-full gap-2">
        <Button className="xs:text-lg h-12 text-base font-bold" onClick={() => onScoreSubmit(0)} variant="outline">
          포기 (0점)
        </Button>
        <Button className="xs:text-lg h-12 flex-1 text-base font-bold" onClick={() => onScoreSubmit(calculatedScore)}>
          <Target className="mr-2 h-5 w-5" />
          {isScored ? '수정하기' : '제출하기'} ({calculatedScore}점)
        </Button>
      </div>
    </div>
  )
}
