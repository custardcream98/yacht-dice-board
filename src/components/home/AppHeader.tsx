'use client'

import { Dice6 } from 'lucide-react'

export function AppHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-lg">
          <Dice6 className="h-12 w-12 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Yacht Dice</h1>
          <p className="text-gray-600">실시간 점수 입력기</p>
        </div>
      </div>
    </div>
  )
}
