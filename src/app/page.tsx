import HomePage from '@/components/pages/HomePage'

export default async function Page({ searchParams }: { searchParams: Promise<{ roomId: string }> }) {
  const { roomId } = await searchParams

  return <HomePage roomId={roomId} />
}
