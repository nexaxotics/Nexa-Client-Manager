import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
        <p className="text-xl text-neutral-500 mb-8">Page not found</p>
        <Link to="/dashboard" className="btn-primary btn">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
