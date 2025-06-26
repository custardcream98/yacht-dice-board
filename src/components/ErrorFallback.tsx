import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const ErrorFallback = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          {children}
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
