import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const ErrorFallback = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-red-50 border-red-200">
        <CardContent className="text-center p-8">
          {children}
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
