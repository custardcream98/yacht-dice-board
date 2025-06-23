import InvitePage from '@/components/pages/InvitePage'

export default async function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params

  return <InvitePage roomId={roomId} />
}
