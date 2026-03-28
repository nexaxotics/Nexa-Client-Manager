import { useQuery } from '@tanstack/react-query'
import { Users, FileText, Mail, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { LIFECYCLE_STAGES, timeAgo, cn } from '@/lib/utils'
import type { DashboardStats, PipelineData, ActivityEvent } from '@/types'

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const res = await api.get('/dashboard/stats')
      return res.data.data as DashboardStats
    },
  })

  const { data: pipeline } = useQuery({
    queryKey: queryKeys.dashboard.pipeline,
    queryFn: async () => {
      const res = await api.get('/dashboard/pipeline')
      return res.data.data as PipelineData[]
    },
  })

  const { data: activity } = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: async () => {
      const res = await api.get('/dashboard/activity')
      return res.data.data as ActivityEvent[]
    },
  })

  const statCards = [
    { label: 'Total Clients', value: stats?.totalClients ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Clients', value: stats?.activeClients ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Docs This Month', value: stats?.docsGeneratedThisMonth ?? 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Emails Sent', value: stats?.emailsSentThisMonth ?? 0, icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const activityIcons: Record<string, string> = {
    doc_generated: '📄',
    email_sent: '✉️',
    client_added: '👤',
    stage_updated: '📊',
    update_added: '📝',
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', card.bg)}>
              <card.icon className={cn('w-5 h-5', card.color)} />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-sm text-neutral-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline view */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Client Pipeline</h2>
          <Link to="/clients" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {LIFECYCLE_STAGES.map((stage) => {
              const count = pipeline?.find((p) => p.stage === stage.stage)?.count ?? 0
              return (
                <Link
                  key={stage.stage}
                  to={`/clients?stage=${stage.stage}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all min-w-[90px] group"
                >
                  <span className="text-2xl">{stage.icon}</span>
                  <span className="text-xl font-bold text-neutral-900">{count}</span>
                  <span className="text-xs text-neutral-500 text-center leading-tight group-hover:text-indigo-600">{stage.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
        </div>
        {!activity || activity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-400 text-sm">No recent activity yet.</p>
            <Link to="/clients/new" className="btn-primary btn btn-sm mt-3 inline-flex">
              <Plus className="w-4 h-4" />
              Add your first client
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50">
                <span className="text-lg mt-0.5">{activityIcons[event.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800">{event.message}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(event.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
