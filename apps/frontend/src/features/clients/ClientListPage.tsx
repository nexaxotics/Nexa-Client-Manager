import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { getApiError } from '@/lib/api'
import { LIFECYCLE_STAGES, formatDate, getStageLabel } from '@/lib/utils'
import type { Client, PaginatedResponse } from '@/types'

export default function ClientListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'active' | 'archived' | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.clients.all({ search, status, page }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(status && { status }),
        sort: 'created_at:desc',
      })
      const res = await api.get(`/clients?${params}`)
      return res.data as { data: Client[], pagination: PaginatedResponse<Client>['pagination'] }
    },
    staleTime: 30_000,
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client archived')
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  const clients = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input w-auto"
          value={status}
          onChange={(e) => { setStatus(e.target.value as ''); setPage(1) }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Link to="/clients/new" className="btn-primary btn btn-sm ml-auto">
          <Plus className="w-4 h-4" />
          New Client
        </Link>
      </div>

      {/* Client cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No clients yet</h3>
          <p className="text-neutral-500 text-sm mb-4">Add your first client to get started.</p>
          <Link to="/clients/new" className="btn-primary btn inline-flex">
            <Plus className="w-4 h-4" />
            Add Your First Client
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-base">{client.businessName}</h3>
                    <p className="text-sm text-neutral-500">{client.fullName}</p>
                  </div>
                  <span className={client.status === 'active' ? 'badge-active' : 'badge-draft'}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{LIFECYCLE_STAGES.find(s => s.stage === client.lifecycleStage)?.icon}</span>
                  <span className="text-xs text-neutral-500">{getStageLabel(client.lifecycleStage)}</span>
                </div>
                <p className="text-xs text-neutral-400 mb-4">Added {formatDate(client.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <Link to={`/clients/${client.id}`} className="btn-secondary btn btn-sm flex-1 text-center">
                    View
                  </Link>
                  <Link to={`/clients/${client.id}?tab=documents`} className="btn-ghost btn btn-sm">
                    Docs
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Archive ${client.businessName}?`)) archiveMutation.mutate(client.id)
                    }}
                    className="btn-ghost btn btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-2">
              <button
                className="btn-secondary btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-secondary btn btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
