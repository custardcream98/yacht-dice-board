import type { Metadata } from 'next'
import './globals.css'
import { pretendard } from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    default: 'Yacht Dice 온라인 입력기',
    template: '%s | Yacht Dice 온라인 입력기',
  },
  description: 'Yacht Dice 점수를 편리하게 기록하고 실시간으로 확인할 수 있는 온라인 입력기 서비스입니다.',
  keywords: ['yacht dice', '요트 다이스', '주사위 게임', '점수판', '전광판', '보드게임'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased ${pretendard.className}`}>{children}</body>
    </html>
  )
}
