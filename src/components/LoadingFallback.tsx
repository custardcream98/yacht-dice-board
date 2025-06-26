import { Dice6 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export const LoadingFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8">
          <div className="mb-4 animate-spin">
            <Dice6 className="h-12 w-12 text-blue-600" />
          </div>
          <p className="text-center text-lg text-gray-700">게임 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    </div>
  )
}
