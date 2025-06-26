/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react'

export const useAsyncHandler = <T extends (...args: any[]) => Promise<any>>(asyncFunction: T) => {
  const [isPending, setIsPending] = useState(false)

  const handleAsync = useCallback(
    async (...args: Parameters<T>) => {
      setIsPending(true)

      try {
        return await asyncFunction(...args)
      } catch (error) {
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [asyncFunction],
  ) as T

  return { isPending, handleAsync }
}
