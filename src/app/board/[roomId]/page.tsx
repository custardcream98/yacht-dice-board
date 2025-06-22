import BoardPage from '@/components/pages/BoardPage'

export default async function GameBoardPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params

  return <BoardPage roomId={roomId} />
}
