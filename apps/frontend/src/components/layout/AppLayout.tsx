import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="main-content flex-1">
        <TopBar />
        <main className="p-6 max-w-[1200px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
