import { onSnapshot, DocumentReference } from 'firebase/firestore'
import { use, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

class FirestoreDocumentStore<T> {
  private listeners = new Set<() => void>()
  private data: null | T = null
  private error: Error | null = null
  private unsubscribe: (() => void) | null = null
  private isInitialized = false
  private initPromise: Promise<null | T>
  private refCount = 0 // 참조 카운팅

  constructor(
    private docRef: DocumentReference,
    private notFoundErrorMessage: string = '문서를 찾을 수 없습니다.',
  ) {
    this.initPromise = this.initialize()
  }

  private async initialize(): Promise<null | T> {
    return new Promise((resolve, reject) => {
      this.unsubscribe = onSnapshot(
        this.docRef,
        doc => {
          if (doc.exists()) {
            const newData = doc.data() as T
            this.data = newData
            this.error = null // 에러 초기화

            if (!this.isInitialized) {
              this.isInitialized = true
              resolve(newData)
            } else {
              // 구독자들에게 변경 알림
              this.notifyListeners()
            }
          } else {
            const error = new Error(this.notFoundErrorMessage)
            this.error = error
            this.data = null
            if (!this.isInitialized) {
              this.isInitialized = true
              reject(error)
            } else {
              this.notifyListeners()
            }
          }
        },
        error => {
          this.error = error
          this.data = null
          if (!this.isInitialized) {
            this.isInitialized = true
            reject(error)
          } else {
            this.notifyListeners()
          }
        },
      )
    })
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // useSyncExternalStore용 - 에러를 throw하지 않고 데이터만 반환
  getSnapshot = () => {
    return this.data
  }

  // 에러 상태 확인용
  getError = () => {
    return this.error
  }

  // 초기 데이터 로딩을 위한 Promise
  getInitPromise() {
    return this.initPromise
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  // 참조 카운트 증가
  addRef() {
    this.refCount++
  }

  // 참조 카운트 감소 및 정리
  removeRef() {
    this.refCount--
    if (this.refCount <= 0) {
      this.destroy()
      return true // 스토어가 정리되었음을 알림
    }
    return false
  }

  // 현재 참조 카운트 반환
  getRefCount() {
    return this.refCount
  }

  // 정리 함수
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.listeners.clear()
    this.refCount = 0
  }
}

const storeCache = new Map<string, FirestoreDocumentStore<unknown>>()

// 스토어 정리 함수
function cleanupStore(cacheKey: string) {
  const store = storeCache.get(cacheKey)
  if (store && store.getRefCount() <= 0) {
    store.destroy()
    storeCache.delete(cacheKey)
  }
}

export function useFirestoreDocument<T>(docRef: DocumentReference, notFoundErrorMessage?: string) {
  const cacheKey = docRef.path
  const storeRef = useRef<FirestoreDocumentStore<T> | null>(null)

  const store = useMemo(() => {
    // 기존 스토어가 있으면 재사용
    if (storeCache.has(cacheKey)) {
      const existingStore = storeCache.get(cacheKey)! as FirestoreDocumentStore<T>
      existingStore.addRef() // 참조 카운트 증가
      storeRef.current = existingStore
      return existingStore
    }

    // 새 스토어 생성
    const newStore = new FirestoreDocumentStore<T>(docRef, notFoundErrorMessage)
    newStore.addRef() // 참조 카운트 증가
    storeCache.set(cacheKey, newStore)
    storeRef.current = newStore
    return newStore
  }, [docRef, cacheKey, notFoundErrorMessage])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (storeRef.current) {
        const shouldCleanup = storeRef.current.removeRef() // 참조 카운트 감소
        if (shouldCleanup) {
          // 마지막 구독자가 떠났으므로 캐시에서도 제거
          cleanupStore(cacheKey)
        }
        storeRef.current = null
      }
    }
  }, [cacheKey])

  use(store.getInitPromise())

  const data = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const error = store.getError()

  if (error || !data) {
    throw new Error(notFoundErrorMessage)
  }

  return data
}
