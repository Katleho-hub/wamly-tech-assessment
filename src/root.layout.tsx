import { Outlet } from 'react-router'

import { TopNav } from './components/top-nav'

export default function RootLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-y-4 px-4 py-2">
      <TopNav />

      <main className="flex w-full flex-col items-center">
        <Outlet />
      </main>
    </div>
  )
}
