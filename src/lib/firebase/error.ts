export class FirebaseCustomError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.code = code
    this.name = 'FirebaseHandlerError'
  }
}
