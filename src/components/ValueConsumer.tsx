export const ValueConsumer = <T,>({ value, children }: { value: T; children: (value: T) => React.ReactNode }) => {
  return children(value)
}
