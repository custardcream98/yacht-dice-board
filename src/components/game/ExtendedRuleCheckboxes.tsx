import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ExtendedRules } from '@/types/game'

export const ExtendedRuleCheckboxes = ({
  className,
  extendedRules,
  handleRuleChange,
}: {
  className?: string
  extendedRules: ExtendedRules
  handleRuleChange: (rule: keyof ExtendedRules, value: boolean) => void
}) => {
  return (
    <div className={cn('mt-3 space-y-3 rounded-lg bg-gray-50 p-4', className)}>
      <h4 className="text-sm font-medium text-gray-700">확장 룰 설정</h4>

      <div className="space-y-3">
        <Label>
          <Checkbox
            checked={extendedRules.fullHouseFixedScore}
            className="mt-0.5"
            onCheckedChange={checked => handleRuleChange('fullHouseFixedScore', !!checked)}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Full House 고정 점수</div>
            <div className="text-xs text-gray-600">Full House를 주사위 합계 대신 25점 고정으로 계산합니다.</div>
          </div>
        </Label>

        <Label>
          <Checkbox
            checked={extendedRules.enableThreeOfAKind}
            className="mt-0.5"
            onCheckedChange={checked => handleRuleChange('enableThreeOfAKind', !!checked)}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">3 of a Kind 족보 추가</div>
            <div className="text-xs text-gray-600">
              같은 숫자 3개 이상일 때 주사위 합계로 점수를 얻는 족보를 추가합니다.
            </div>
          </div>
        </Label>
      </div>
    </div>
  )
}
