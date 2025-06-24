import { Calculator, Lock, Target, Plus, Minus, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'

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
import { exhaustiveCheck } from '@/lib/types'
import { cn } from '@/lib/utils'
import { YachtDiceCalculator, CATEGORY_NAMES } from '@/lib/yacht-dice-rules'
import { ScoreCategory, Player, ExtendedRules, DiceValue, DiceHand } from '@/types/game'

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6] as const
const DiceIcon = ({ value }: { value: DiceValue }) => {
  const Icon = DICE_ICONS[value - 1]
  return <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
}

interface ScoreInputProps {
  extendedRules: ExtendedRules
  isMyTurn: boolean
  myPlayer: Player
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}

export function ScoreInput({ extendedRules, myPlayer, isMyTurn, onScoreSubmit }: ScoreInputProps) {
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
              <Lock className="h-3 w-3 mr-1" />
              대기 중
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상위 섹션 */}
        <div>
          <h3 className="font-bold mb-3 text-blue-700">상위 섹션</h3>
          <div className="grid grid-cols-2 gap-2">
            {UPPER_SECTION_CATEGORIES.map(category => {
              const score = myPlayer?.scores[category]
              const isScored = score !== undefined
              const isWaitingTurn = !isMyTurn

              return (
                <UpperSectionDialog category={category} key={category} onScoreSubmit={onScoreSubmit}>
                  <Button
                    className={cn(
                      'h-16 flex flex-col items-center justify-center p-2 relative overflow-hidden',
                      isWaitingTurn
                        ? 'opacity-50 cursor-not-allowed'
                        : isScored
                          ? 'cursor-not-allowed bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-md transform'
                          : 'hover:bg-blue-50 hover:border-blue-300',
                    )}
                    disabled={isWaitingTurn}
                    onClick={event => {
                      if (isScored) {
                        event.preventDefault()
                      }
                    }}
                    variant={isScored ? 'secondary' : 'outline'}
                  >
                    {isScored && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-blue-100/40 pointer-events-none" />
                    )}
                    <div className="flex items-center gap-1 mb-1 relative z-10">
                      <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
                      <span className={cn('text-xs font-bold', isScored && 'text-blue-700')}>
                        {CATEGORY_NAMES[category]}
                      </span>
                    </div>
                    <div className={cn('font-bold relative z-10', isScored ? 'text-blue-800 text-xl' : 'text-lg')}>
                      {isScored ? `${score}점` : '-'}
                    </div>
                    {isWaitingTurn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
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
          <h3 className="font-bold mb-3 text-green-700">하위 섹션</h3>
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
                  extendedRules={extendedRules}
                  key={category}
                  onScoreSubmit={onScoreSubmit}
                >
                  <Button
                    className={cn(
                      'h-16 flex items-center justify-between p-4 relative overflow-hidden',
                      isWaitingTurn
                        ? 'opacity-50 cursor-not-allowed'
                        : isScored
                          ? 'cursor-not-allowed bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-md transform'
                          : 'hover:bg-green-50 hover:border-green-300',
                    )}
                    disabled={isWaitingTurn}
                    onClick={event => {
                      if (isScored) {
                        event.preventDefault()
                      }
                    }}
                    variant={isScored ? 'secondary' : 'outline'}
                  >
                    {isScored && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-green-100/40 pointer-events-none" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold relative z-10', isScored && 'text-green-700')}>
                        {CATEGORY_NAMES[category]}
                      </span>
                      {/* 확장 룰 표시 */}
                      {isExtendedRule && (
                        <Badge className="text-xs bg-orange-100 text-orange-800" variant="outline">
                          확장
                        </Badge>
                      )}
                    </div>
                    <span className={cn('font-bold relative z-10', isScored ? 'text-green-800 text-xl' : 'text-lg')}>
                      {isScored ? `${score}점` : '-'}
                    </span>
                    {isWaitingTurn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
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
  children,
}: React.PropsWithChildren<{
  category: (typeof UPPER_SECTION_CATEGORIES)[number]
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
            {CATEGORY_NAMES[category]}
          </DialogTitle>
        </DialogHeader>
        <UpperSectionInput
          category={category}
          onScoreSubmit={score => {
            onScoreSubmit(category, score)
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

const UpperSectionInput = ({
  category,
  onScoreSubmit,
}: {
  category: (typeof UPPER_SECTION_CATEGORIES)[number]
  onScoreSubmit: (score: number) => void
}) => {
  const [diceCount, setDiceCount] = useState(0)

  const increment = () => setDiceCount(prev => prev + 1)
  const decrement = () => setDiceCount(prev => prev - 1)

  const calculatedScore = useMemo(
    () => YachtDiceCalculator.calculateUpperSection(diceCount, UPPER_SECTION_DICE_COUNT[category]),
    [diceCount, category],
  )

  const diceValue = UPPER_SECTION_DICE_COUNT[category]

  return (
    <div className="space-y-6">
      <div className="text-center bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-1">
          <DiceIcon value={diceValue} />
          <span className="text-sm font-medium text-gray-700">{diceValue}이 나온 주사위 개수를 입력하세요</span>
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

        <div className="flex items-center justify-center h-20 w-20 border-2 border-blue-300 rounded-xl bg-blue-50 text-2xl font-bold text-blue-700">
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
      <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
        <div className="text-sm text-blue-600 mb-1 font-medium">계산된 점수</div>
        <div className="text-3xl font-bold text-blue-700">{calculatedScore}점</div>
        <div className="text-xs text-blue-500 mt-1">
          {diceValue} × {diceCount} = {calculatedScore}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-2 w-full">
        <Button className="h-12 text-lg font-bold" onClick={() => onScoreSubmit(0)} variant="outline">
          0점 제출하기
        </Button>
        <Button
          className="flex-1 h-12 text-lg font-bold"
          disabled={diceCount === 0}
          onClick={() => onScoreSubmit(calculatedScore)}
        >
          <Target className="h-5 w-5 mr-1" />
          점수 제출하기
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
  children,
}: React.PropsWithChildren<{
  category: (typeof LOWER_SECTION_CATEGORIES)[number]
  extendedRules: ExtendedRules
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}>) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog key={category} onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {CATEGORY_NAMES[category]}
            {/* 확장 룰 표시 */}
            {category === 'threeOfAKind' && extendedRules.enableThreeOfAKind && (
              <Badge className="text-xs bg-orange-100 text-orange-800" variant="outline">
                확장 룰
              </Badge>
            )}
            {category === 'fullHouse' && extendedRules.fullHouseFixedScore && (
              <Badge className="text-xs bg-orange-100 text-orange-800" variant="outline">
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
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'fourOfAKind':
                return (
                  <DiceInput
                    {...FOUR_OF_A_KIND_INFO}
                    calculateScore={YachtDiceCalculator.calculateFourOfAKind}
                    onScoreSubmit={handleSubmit}
                  />
                )
              case 'fullHouse': {
                if (extendedRules.fullHouseFixedScore) {
                  return <YesNoInput {...FULL_HOUSE_INFO} onScoreSubmit={handleSubmit} />
                } else {
                  return (
                    <DiceInput
                      calculateScore={YachtDiceCalculator.calculateFullHouse}
                      description={FULL_HOUSE_INFO.description}
                      onScoreSubmit={handleSubmit}
                    />
                  )
                }
              }
              case 'smallStraight':
                return <YesNoInput {...SMALL_STRAIGHT_INFO} onScoreSubmit={handleSubmit} />
              case 'largeStraight':
                return <YesNoInput {...LARGE_STRAIGHT_INFO} onScoreSubmit={handleSubmit} />
              case 'yacht':
                return <YachtYesNoInput onScoreSubmit={handleSubmit} />
              case 'chance':
                return (
                  <DiceInput
                    {...CHANCE_INFO}
                    calculateScore={YachtDiceCalculator.calculateChance}
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
}: YesNoInputInfo & { onScoreSubmit: (score: number) => void }) => {
  return (
    <div className="space-y-6">
      {/* 족보 설명 */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <p className="text-green-700 font-bold text-center">{description}</p>
        {examples && (
          <div className="space-y-1 mt-3">
            <div className="text-sm text-green-600 font-medium">예시:</div>
            {examples.map((example, idx) => (
              <div
                className="text-green-600 bg-white/50 px-2 py-1 rounded flex items-center gap-1 justify-center"
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
        <p className="text-lg font-medium text-gray-800 mb-4">위 조건에 맞는 주사위가 나왔나요?</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 w-full">
        <Button
          className="h-14 text-lg font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={() => onScoreSubmit(0)}
          variant="outline"
        >
          포기하기 (0점)
        </Button>
        <Button
          className="flex-1 h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
          onClick={() => onScoreSubmit(score)}
        >
          <Target className="h-5 w-5 mr-2" />
          네! ({score}점)
        </Button>
      </div>
    </div>
  )
}

const YachtYesNoInput = ({ onScoreSubmit }: { onScoreSubmit: (score: number) => void }) => {
  return (
    <div className="space-y-6">
      {/* 족보 설명 */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-lg border border-yellow-200">
        <div className="text-center mb-3 text-xl font-bold text-orange-800">요트</div>
        <p className="text-orange-700 text-center">같은 숫자 5개</p>
      </div>

      {/* 축하 질문 */}
      <div className="text-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-lg font-medium text-gray-800 mb-2">요트가 나왔나요?</p>
        <p className="text-sm text-gray-600">게임의 최고 점수입니다!</p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button
          className="flex-1 h-14 text-lg font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={() => onScoreSubmit(0)}
          variant="outline"
        >
          아니요 (0점)
        </Button>
        <Button
          className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
          onClick={() => onScoreSubmit(FIXED_SCORE_CATEGORIES.yacht)}
        >
          <Target className="h-5 w-5 mr-2" />
          🎉 네! ({FIXED_SCORE_CATEGORIES.yacht}점)
        </Button>
      </div>
    </div>
  )
}

const INITIAL_DICE = [1, 1, 1, 1, 1] as const satisfies DiceHand
function DiceInput({
  description,
  calculateScore,
  onScoreSubmit,
}: HandInfo & {
  calculateScore: (dice: DiceHand) => number
  onScoreSubmit: (score: number) => void
}) {
  const [dice, setDice] = useState<DiceHand>(INITIAL_DICE)

  const calculatedScore = useMemo(() => calculateScore(dice), [dice, calculateScore])

  const incrementDice = useCallback((index: number) => {
    setDice(prevDice => {
      const newDice: DiceHand = [...prevDice]
      newDice[index] = (prevDice[index] + 1) as DiceValue
      return newDice
    })
  }, [])

  const decrementDice = useCallback((index: number) => {
    setDice(prevDice => {
      const newDice: DiceHand = [...prevDice]
      newDice[index] = (prevDice[index] - 1) as DiceValue
      return newDice
    })
  }, [])

  return (
    <div className="space-y-4">
      {/* 족보 설명 */}
      <div className="text-center bg-gray-50 p-3 rounded-lg text-sm font-medium text-gray-700">{description}</div>

      <div className="space-y-4">
        {/* 주사위 입력 */}
        <div className="grid grid-cols-5 gap-2">
          {dice.map((value, index) => (
            <div className="text-center" key={index}>
              <div className="flex flex-col gap-1">
                <Button
                  className="h-8 w-full p-0"
                  disabled={value >= 6}
                  onClick={() => incrementDice(index)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <div className="flex items-center justify-center h-16 border-2 border-gray-300 rounded-lg bg-white">
                  <DiceIcon value={value} />
                </div>
                <Button
                  className="h-8 w-full p-0"
                  disabled={value <= 1}
                  onClick={() => decrementDice(index)}
                  size="sm"
                  variant="outline"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 계산된 점수 표시 */}
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-sm text-blue-600 mb-1 font-medium">계산된 점수</div>
          <div className="text-3xl font-bold text-blue-700">{calculatedScore}점</div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-2 w-full">
        <Button className="h-12 text-lg font-bold" onClick={() => onScoreSubmit(0)} variant="outline">
          포기하기 (0점)
        </Button>
        <Button className="flex-1 h-12 text-lg font-bold" onClick={() => onScoreSubmit(calculatedScore)}>
          <Target className="h-5 w-5 mr-2" />
          점수 제출하기
        </Button>
      </div>
    </div>
  )
}
