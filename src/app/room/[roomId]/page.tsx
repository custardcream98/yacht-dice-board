import GameRoomPage from '@/components/pages/GameRoomPage'

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>
  searchParams: Promise<{ player: string }>
}) {
  const { roomId } = await params
  const { player } = await searchParams

  return <GameRoomPage roomId={roomId} playerName={player} />
}
