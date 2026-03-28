import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, FileText, LayoutDashboard, Activity, Mail, User } from 'lucide-react'
import api from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { getApiError } from '@/lib/api'
import { LIFECYCLE_STAGES, getStageLabel, formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Client, Document, StatusUpdate, EmailLog } from '@/types'
import { DOC_TYPES } from '@/lib/utils'

type TabId = 'profile' | 'documents' | 'status' | 'updates' | 'emails'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'status', label: 'Status Board', icon: LayoutDashboard },
  { id: 'updates', label: 'Update Log', icon: Activity },
  { id: 'emails', label: 'Emails Sent', icon: Mail },
]

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const queryClient = useQueryClient()

  const { data: client, isLoading } = useQuery({
    queryKey: queryKeys.clients.one(id!),
    queryFn: async () => {
      const res = await api.get(`/clients/${id}`)
      return res.data.data as Client
    },
    enabled: !!id,
  })

  const stageMutation = useMutation({
    mutationFn: (stage: number) => api.patch(`/clients/${id}/stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.one(id!) })
      toast.success('Stage updated')
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!client) {
    return <div className="card text-center py-16 text-neutral-500">Client not found</div>
  }

  return (
    <div className="space-y-4">
      {/* Client header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{client.businessName}</h2>
            <p className="text-neutral-500 mt-0.5">{client.fullName} · {client.email}</p>
            {client.phone && <p className="text-sm text-neutral-400">{client.phone}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={client.status === 'active' ? 'badge-active' : 'badge-draft'}>
              {client.status}
            </span>
            <span className="badge badge-sent">
              {LIFECYCLE_STAGES.find(s => s.stage === client.lifecycleStage)?.icon} Stage {client.lifecycleStage}: {getStageLabel(client.lifecycleStage)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-neutral-200 bg-white rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0',
                activeTab === tabId
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === 'profile' && <ProfileTab client={client} clientId={id!} />}
        {activeTab === 'documents' && <DocumentsTab clientId={id!} />}
        {activeTab === 'status' && <StatusTab client={client} onStageChange={(s) => stageMutation.mutate(s)} />}
        {activeTab === 'updates' && <UpdatesTab clientId={id!} />}
        {activeTab === 'emails' && <EmailsTab clientId={id!} />}
      </div>
    </div>
  )
}

// ------- Tab components -------

function ProfileTab({ client, clientId }: { client: Client; clientId: string }) {
  const queryClient = useQueryClient()
  const fields: { label: string; value: string | undefined }[] = [
    { label: 'Business Name', value: client.businessName },
    { label: 'Full Name', value: client.fullName },
    { label: 'Email', value: client.email },
    { label: 'Phone', value: client.phone },
    { label: 'Address', value: client.address },
    { label: 'Website', value: client.website },
    { label: 'Services Contracted', value: client.servicesContracted?.join(', ') },
    { label: 'Start Date', value: client.startDate && formatDate(client.startDate) },
    { label: 'Contract Duration', value: client.contractDuration },
    { label: 'Monthly Fee', value: client.monthlyFee ? formatCurrency(client.monthlyFee, client.currency) : undefined },
    { label: 'Payment Terms', value: client.paymentTerms },
    { label: 'Business Goals', value: client.businessGoals },
    { label: 'Target Audience', value: client.targetAudience },
    { label: 'Key Metrics', value: client.keyMetrics },
    { label: 'Reporting Frequency', value: client.reportingFrequency },
  ]

  return (
    <div>
      <h3 className="font-semibold text-neutral-800 mb-4">Client Profile</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ label, value }) =>
          value ? (
            <div key={label}>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm text-neutral-800">{value}</p>
            </div>
          ) : null
        )}
      </div>
      <p className="text-xs text-neutral-400 mt-6">Added {formatDate(client.createdAt)}</p>
    </div>
  )
}

function DocumentsTab({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient()
  const { data: documents, isLoading } = useQuery({
    queryKey: queryKeys.clients.documents(clientId),
    queryFn: async () => {
      const res = await api.get(`/clients/${clientId}/documents`)
      return res.data.data as Document[]
    },
  })

  const generateMutation = useMutation({
    mutationFn: (docType: string) => api.post(`/clients/${clientId}/documents/${docType}/generate`),
    onSuccess: () => {
      toast.success('Document generated!')
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.documents(clientId) })
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  const sendEmailMutation = useMutation({
    mutationFn: (docType: string) => api.post(`/clients/${clientId}/documents/${docType}/send-email`),
    onSuccess: () => {
      toast.success('Email sent to client!')
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.documents(clientId) })
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500 w-6 h-6" /></div>

  const docMap: Record<string, Document> = {}
  documents?.forEach((d) => { docMap[d.docType] = d })

  return (
    <div>
      <h3 className="font-semibold text-neutral-800 mb-4">Client Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOC_TYPES.map(({ type, label }) => {
          const doc = docMap[type]
          const status = doc?.status ?? 'draft'
          return (
            <div key={type} className="border border-neutral-200 rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-800">{label}</p>
                <span className={cn('mt-1', status === 'sent' ? 'badge-sent' : status === 'generated' ? 'badge-pending' : status === 'acknowledged' ? 'badge-acknowledged' : 'badge-draft')}>
                  {status}
                </span>
                {doc?.sentAt && <p className="text-xs text-neutral-400 mt-1">Sent {formatDate(doc.sentAt)}</p>}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => generateMutation.mutate(type)}
                  disabled={generateMutation.isPending}
                  className="btn-primary btn btn-sm text-xs"
                >
                  {generateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {doc && doc.status !== 'draft' ? 'Regenerate' : 'Generate'}
                </button>
                {doc && doc.status !== 'draft' && (
                  <button
                    onClick={() => sendEmailMutation.mutate(type)}
                    disabled={sendEmailMutation.isPending}
                    className="btn-secondary btn btn-sm text-xs"
                  >
                    Send Email
                  </button>
                )}
                {doc && doc.status !== 'draft' && (
                  <div className="flex gap-1.5 w-full mt-1">
                    <button
                      onClick={() => window.open(`/api/clients/${clientId}/documents/${type}/download`, '_blank')}
                      className="btn-secondary btn btn-sm py-1 px-2 text-[10px] w-full"
                    >
                      View PDF
                    </button>
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = `/api/clients/${clientId}/documents/${type}/download?download=true`
                        a.download = `${type}.pdf`
                        a.click()
                      }}
                      className="btn-secondary btn btn-sm py-1 px-2 text-[10px] w-full"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusTab({ client, onStageChange }: { client: Client; onStageChange: (s: number) => void }) {
  return (
    <div>
      <h3 className="font-semibold text-neutral-800 mb-4">Lifecycle Pipeline</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {LIFECYCLE_STAGES.map((stage) => (
            <button
              key={stage.stage}
              onClick={() => {
                if (stage.stage === client.lifecycleStage) return
                if (stage.stage < client.lifecycleStage) {
                  if (!confirm(`Regress to Stage ${stage.stage}: ${stage.name}?`)) return
                }
                onStageChange(stage.stage)
              }}
              className={cn(
                stage.stage < client.lifecycleStage
                  ? 'stage-completed'
                  : stage.stage === client.lifecycleStage
                  ? 'stage-current'
                  : 'stage-future'
              )}
            >
              <span className="text-2xl">{stage.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{stage.name}</span>
              <span className="text-xs opacity-60">Stage {stage.stage}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function UpdatesTab({ clientId }: { clientId: string }) {
  const [content, setContent] = useState('')
  const [updateType, setUpdateType] = useState<'daily' | 'weekly'>('weekly')
  const queryClient = useQueryClient()

  const { data: updates } = useQuery({
    queryKey: queryKeys.clients.updates(clientId),
    queryFn: async () => {
      const res = await api.get(`/clients/${clientId}/updates`)
      return res.data.data as StatusUpdate[]
    },
  })

  const addMutation = useMutation({
    mutationFn: () => api.post(`/clients/${clientId}/updates`, { content, updateType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.updates(clientId) })
      setContent('')
      toast.success('Update added')
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  return (
    <div>
      <h3 className="font-semibold text-neutral-800 mb-4">Status Updates</h3>
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          {(['daily', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setUpdateType(t)}
              className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
                updateType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-neutral-200 text-neutral-600 hover:border-indigo-300'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="What was done this week? What's next?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={() => addMutation.mutate()} disabled={!content.trim() || addMutation.isPending} className="btn-primary btn btn-sm">
          {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Update
        </button>
      </div>
      <div className="space-y-3 border-t border-neutral-100 pt-4">
        {!updates || updates.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">No updates yet</p>
        ) : (
          updates.map((u) => (
            <div key={u.id} className="border border-neutral-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={u.updateType === 'weekly' ? 'badge-sent' : 'badge-pending capitalize'}>
                  {u.updateType}
                </span>
                <span className="text-xs text-neutral-400">{formatDate(u.createdAt)}</span>
              </div>
              <p className="text-sm text-neutral-700">{u.content}</p>
              {u.nextSteps && <p className="text-xs text-neutral-500 mt-1"><strong>Next:</strong> {u.nextSteps}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EmailsTab({ clientId }: { clientId: string }) {
  const { data: emails } = useQuery({
    queryKey: queryKeys.clients.emails(clientId),
    queryFn: async () => {
      const res = await api.get(`/clients/${clientId}/emails`)
      return res.data.data as EmailLog[]
    },
  })

  return (
    <div>
      <h3 className="font-semibold text-neutral-800 mb-4">Emails Sent</h3>
      {!emails || emails.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">No emails sent yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-2 px-3">To</th>
                <th className="text-left py-2 px-3">Subject</th>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((e) => (
                <tr key={e.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-2.5 px-3 text-neutral-700">{e.toEmail}</td>
                  <td className="py-2.5 px-3 text-neutral-600 max-w-[200px] truncate">{e.subject}</td>
                  <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap">{formatDate(e.sentAt)}</td>
                  <td className="py-2.5 px-3">
                    <span className={e.status === 'sent' ? 'badge-active' : 'badge-failed'}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
