export const exhaustiveCheck = (value: never): never => {
  throw new Error(`Unhandled value: ${value}`)
}
