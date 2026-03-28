import { useLocation } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/clients/new': 'New Client',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const agency = useAuthStore((s) => s.agency)

  const getTitle = () => {
    if (location.pathname.startsWith('/clients/') && location.pathname !== '/clients/new') {
      return 'Client Details'
    }
    return PAGE_TITLES[location.pathname] ?? 'Nexaxotics'
  }

  return (
    <header className="top-bar">
      <h1 className="text-lg font-semibold text-neutral-900">{getTitle()}</h1>

      <div className="flex items-center gap-3">
        {(location.pathname === '/clients' || location.pathname === '/dashboard') && (
          <button
            onClick={() => navigate('/clients/new')}
            className="btn-primary btn-sm btn text-sm"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        )}
        <button className="btn-ghost btn p-2 rounded-full">
          <Bell className="w-5 h-5 text-neutral-500" />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: agency?.brandColor ?? '#4F46E5' }}
        >
          {agency?.name?.charAt(0).toUpperCase() ?? 'A'}
        </div>
      </div>
    </header>
  )
}
