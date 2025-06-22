'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { YachtDiceCalculator, CATEGORY_NAMES } from '@/lib/yacht-dice-rules'
import { ScoreCategory, Player } from '@/types/game'
import { UPPER_SECTION_CATEGORIES, LOWER_SECTION_CATEGORIES } from '@/constants/game'
import { Calculator, Lock, Check, Target, Plus, Minus, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
  const Icon = icons[value - 1] || Dice1
  return <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
}

interface MobileScoreInputProps {
  category: ScoreCategory
  currentScore?: number
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}

function MobileScoreInput({ category, currentScore, onScoreSubmit }: MobileScoreInputProps) {
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1])
  const [manualScore, setManualScore] = useState('')
  const [inputMode, setInputMode] = useState<'dice' | 'manual'>('dice')

  const calculatedScore = YachtDiceCalculator.calculateScore(category, dice)

  const updateDie = (index: number, value: number) => {
    const newDice = [...dice]
    newDice[index] = Math.max(1, Math.min(6, value))
    setDice(newDice)
  }

  const handleSubmit = () => {
    const score = inputMode === 'dice' ? calculatedScore : parseInt(manualScore) || 0
    onScoreSubmit(category, score)
  }

  const isUpperSection = UPPER_SECTION_CATEGORIES.includes(category)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">{CATEGORY_NAMES[category]}</h3>
        {currentScore !== undefined && (
          <div className="text-sm text-gray-600 mb-2">
            현재 점수: <span className="font-bold">{currentScore}점</span>
          </div>
        )}
      </div>

      {/* 입력 모드 선택 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={inputMode === 'dice' ? 'default' : 'outline'}
          onClick={() => setInputMode('dice')}
          className="flex-1 text-xs sm:text-sm"
        >
          🎲 주사위 입력
        </Button>
        <Button
          variant={inputMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setInputMode('manual')}
          className="flex-1 text-xs sm:text-sm"
        >
          ✏️ 직접 입력
        </Button>
      </div>

      {inputMode === 'dice' ? (
        <div className="space-y-4">
          {/* 주사위 입력 */}
          <div className="grid grid-cols-5 gap-2">
            {dice.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateDie(index, value + 1)}
                    className="h-8 w-full p-0"
                    disabled={value >= 6}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center justify-center h-16 border-2 border-gray-300 rounded-lg bg-white">
                    <DiceIcon value={value} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateDie(index, value - 1)}
                    className="h-8 w-full p-0"
                    disabled={value <= 1}
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
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 수동 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">점수 직접 입력</label>
            <Input
              type="number"
              value={manualScore}
              onChange={e => setManualScore(e.target.value)}
              placeholder="점수를 입력하세요"
              className="text-lg text-center"
              min="0"
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
        onClick={handleSubmit}
        className="w-full h-12 text-lg font-bold"
        disabled={inputMode === 'manual' && !manualScore}
      >
        <Target className="h-5 w-5 mr-2" />
        점수 제출하기
      </Button>
    </div>
  )
}

interface ScoreInputProps {
  myPlayer: Player
  isMyTurn: boolean
  onScoreSubmit: (category: ScoreCategory, score: number) => void
}

export function ScoreInput({ myPlayer, isMyTurn, onScoreSubmit }: ScoreInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          점수 입력
          {!isMyTurn && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <Lock className="h-3 w-3 mr-1" />
              대기 중
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상위 섹션 */}
        <div>
          <h3 className="font-bold mb-3 text-blue-700">상위 섹션 (1-6)</h3>
          <div className="grid grid-cols-2 gap-2">
            {UPPER_SECTION_CATEGORIES.map(category => {
              const score = myPlayer?.scores[category]
              const isScored = score !== undefined
              const isDisabled = !isMyTurn || isScored

              return (
                <Dialog key={category}>
                  <DialogTrigger asChild>
                    <Button
                      variant={isScored ? 'secondary' : 'outline'}
                      className={`h-16 flex flex-col items-center justify-center p-2 relative ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                      disabled={isDisabled}
                    >
                      {isScored && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-1 mb-1">
                        <DiceIcon value={parseInt(category.replace('s', '').slice(-1)) || 1} />
                        <span className="text-xs font-bold">{CATEGORY_NAMES[category]}</span>
                      </div>
                      <div className="text-lg font-bold">{isScored ? `${score}점` : '-'}</div>
                      {!isMyTurn && !isScored && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <DiceIcon value={parseInt(category.replace('s', '').slice(-1)) || 1} />
                        {CATEGORY_NAMES[category]}
                      </DialogTitle>
                    </DialogHeader>
                    <MobileScoreInput category={category} currentScore={score} onScoreSubmit={onScoreSubmit} />
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
            {LOWER_SECTION_CATEGORIES.map(category => {
              const score = myPlayer?.scores[category]
              const isScored = score !== undefined
              const isDisabled = !isMyTurn || isScored

              return (
                <Dialog key={category}>
                  <DialogTrigger asChild>
                    <Button
                      variant={isScored ? 'secondary' : 'outline'}
                      className={`h-16 flex items-center justify-between p-4 relative ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 hover:border-green-300'
                      }`}
                      disabled={isDisabled}
                    >
                      {isScored && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      <span className="font-bold">{CATEGORY_NAMES[category]}</span>
                      <span className="text-lg font-bold">{isScored ? `${score}점` : '-'}</span>
                      {!isMyTurn && !isScored && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{CATEGORY_NAMES[category]}</DialogTitle>
                    </DialogHeader>
                    <MobileScoreInput category={category} currentScore={score} onScoreSubmit={onScoreSubmit} />
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
