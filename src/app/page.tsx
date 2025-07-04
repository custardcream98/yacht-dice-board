import { AppFooter, AppHeader, CreateRoomCard, DeleteRoomCard, JoinRoomCard } from '@/components/home'

export default async function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <AppHeader />

        {/* 방 생성 */}
        <CreateRoomCard />

        {/* 방 참여 */}
        <JoinRoomCard />

        {/* 방 삭제 */}
        <DeleteRoomCard />

        {/* 하단 정보 */}
        <AppFooter />
      </div>
    </div>
  )
}
