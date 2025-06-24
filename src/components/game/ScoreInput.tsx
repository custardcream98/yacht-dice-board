import { Calculator, Lock, Target, Plus, Minus, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { UPPER_SECTION_CATEGORIES, LOWER_SECTION_CATEGORIES, UPPER_SECTION_DICE_COUNT } from '@/constants/game'
import { YachtDiceCalculator, CATEGORY_NAMES } from '@/lib/yacht-dice-rules'
import { ScoreCategory, Player, ExtendedRules } from '@/types/game'

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
  const Icon = icons[value - 1] || Dice1
  return <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
}

interface MobileScoreInputProps {
  category: ScoreCategory
  extendedRules: ExtendedRules
  onClose?: () => void
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}

type Dice = [number, number, number, number, number]
const INITIAL_DICE = [1, 1, 1, 1, 1] as const satisfies Dice
function ScoreInputContents({ category, extendedRules, onScoreSubmit, onClose }: MobileScoreInputProps) {
  const [dice, setDice] = useState<Dice>(INITIAL_DICE)
  const [manualScore, setManualScore] = useState('')
  const [inputMode, setInputMode] = useState<'dice' | 'manual'>('dice')

  const calculatedScore = useMemo(
    () => YachtDiceCalculator.calculateScore({ category, dice, extendedRules }),
    [category, dice, extendedRules],
  )

  // 최적화된 주사위 업데이트 함수
  const incrementDice = useCallback((index: number) => {
    setDice(prevDice => {
      const newDice: Dice = [...prevDice]
      newDice[index] = prevDice[index] + 1
      return newDice
    })
  }, [])

  const decrementDice = useCallback((index: number) => {
    setDice(prevDice => {
      const newDice: Dice = [...prevDice]
      newDice[index] = prevDice[index] - 1
      return newDice
    })
  }, [])

  const handleSubmit = () => {
    const score = inputMode === 'dice' ? calculatedScore : parseInt(manualScore) || 0
    onScoreSubmit(category, score)
    onClose?.()
  }

  const isUpperSection = UPPER_SECTION_CATEGORIES.some(c => c === category)

  return (
    <div className="space-y-4">
      {/* 입력 모드 선택 */}
      <div className="flex gap-2 mb-4">
        <Button
          className="flex-1 text-xs sm:text-sm"
          onClick={() => setInputMode('dice')}
          variant={inputMode === 'dice' ? 'default' : 'outline'}
        >
          🎲 주사위 입력
        </Button>
        <Button
          className="flex-1 text-xs sm:text-sm"
          onClick={() => setInputMode('manual')}
          variant={inputMode === 'manual' ? 'default' : 'outline'}
        >
          ✏️ 직접 입력
        </Button>
      </div>

      {inputMode === 'dice' ? (
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
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">계산된 점수</div>
            <div className="text-3xl font-bold text-blue-600">{calculatedScore}점</div>
            {isUpperSection && <div className="text-xs text-gray-500 mt-1">{category}의 합계</div>}
            {/* 확장 룰 표시 */}
            {category === 'fullHouse' && extendedRules.fullHouseFixedScore && (
              <div className="text-xs text-orange-600 mt-1">고정 점수 적용 (25점)</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 수동 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">점수 직접 입력</label>
            <Input
              className="text-lg text-center"
              min="0"
              onChange={e => setManualScore(e.target.value)}
              placeholder="점수를 입력하세요"
              type="number"
              value={manualScore}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">입력할 점수</div>
            <div className="text-3xl font-bold text-gray-700">{manualScore || '0'}점</div>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        className="w-full h-12 text-lg font-bold"
        disabled={inputMode === 'manual' && !manualScore}
        onClick={handleSubmit}
      >
        <Target className="h-5 w-5 mr-2" />
        점수 제출하기
      </Button>
    </div>
  )
}

interface ScoreInputProps {
  extendedRules: ExtendedRules
  isMyTurn: boolean
  myPlayer: Player
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}

export function ScoreInput({ extendedRules, myPlayer, isMyTurn, onScoreSubmit }: ScoreInputProps) {
  const [openDialog, setOpenDialog] = useState<null | ScoreCategory>(null)

  const handleScoreSubmit = (category: ScoreCategory, score: number) => {
    onScoreSubmit(category, score)
    setOpenDialog(null) // 점수 제출 후 다이얼로그 닫기
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
                <Dialog
                  key={category}
                  onOpenChange={close => !close && setOpenDialog(null)}
                  open={openDialog === category}
                >
                  <DialogTrigger asChild>
                    <Button
                      className={`h-16 flex flex-col items-center justify-center p-2 relative overflow-hidden ${
                        isWaitingTurn
                          ? 'opacity-50 cursor-not-allowed'
                          : isScored
                            ? 'cursor-not-allowed bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 shadow-md transform'
                            : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                      disabled={isWaitingTurn}
                      onClick={() => !isScored && setOpenDialog(category)}
                      variant={isScored ? 'secondary' : 'outline'}
                    >
                      {isScored && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-blue-100/40 pointer-events-none" />
                      )}
                      <div className="flex items-center gap-1 mb-1 relative z-10">
                        <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
                        <span className={`text-xs font-bold ${isScored ? 'text-blue-700' : ''}`}>
                          {CATEGORY_NAMES[category]}
                        </span>
                      </div>
                      <div className={`font-bold relative z-10 ${isScored ? 'text-blue-800 text-xl' : 'text-lg'}`}>
                        {isScored ? `${score}점` : '-'}
                      </div>
                      {isWaitingTurn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <DiceIcon value={UPPER_SECTION_DICE_COUNT[category]} />
                        {CATEGORY_NAMES[category]}
                      </DialogTitle>
                    </DialogHeader>
                    <ScoreInputContents
                      category={category}
                      extendedRules={extendedRules}
                      onClose={() => setOpenDialog(null)}
                      onScoreSubmit={handleScoreSubmit}
                    />
                  </DialogContent>
                </Dialog>
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

              return (
                <Dialog
                  key={category}
                  onOpenChange={close => !close && setOpenDialog(null)}
                  open={openDialog === category}
                >
                  <DialogTrigger asChild>
                    <Button
                      className={`h-16 flex items-center justify-between p-4 relative overflow-hidden ${
                        isWaitingTurn
                          ? 'opacity-50 cursor-not-allowed'
                          : isScored
                            ? 'cursor-not-allowed bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-md transform'
                            : 'hover:bg-green-50 hover:border-green-300'
                      }`}
                      disabled={isWaitingTurn}
                      onClick={() => !isScored && setOpenDialog(category)}
                      variant={isScored ? 'secondary' : 'outline'}
                    >
                      {isScored && (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-green-100/40 pointer-events-none" />
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`font-bold relative z-10 ${isScored ? 'text-green-700' : ''}`}>
                          {CATEGORY_NAMES[category]}
                        </span>
                        {/* 확장 룰 표시 */}
                        {category === 'threeOfAKind' && extendedRules.enableThreeOfAKind && (
                          <Badge className="text-xs bg-orange-100 text-orange-800" variant="outline">
                            확장
                          </Badge>
                        )}
                        {category === 'fullHouse' && extendedRules.fullHouseFixedScore && (
                          <Badge className="text-xs bg-orange-100 text-orange-800" variant="outline">
                            고정 25점
                          </Badge>
                        )}
                      </div>
                      <span className={`font-bold relative z-10 ${isScored ? 'text-green-800 text-xl' : 'text-lg'}`}>
                        {isScored ? `${score}점` : '-'}
                      </span>
                      {isWaitingTurn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
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
                    <ScoreInputContents
                      category={category}
                      extendedRules={extendedRules}
                      onClose={() => setOpenDialog(null)}
                      onScoreSubmit={handleScoreSubmit}
                    />
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
