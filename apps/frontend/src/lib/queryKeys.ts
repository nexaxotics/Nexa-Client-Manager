export const queryKeys = {
  agency: {
    me: ['agency', 'me'] as const,
  },
  clients: {
    all: (params?: Record<string, unknown>) => ['clients', params] as const,
    one: (id: string) => ['clients', id] as const,
    documents: (clientId: string) => ['clients', clientId, 'documents'] as const,
    updates: (clientId: string) => ['clients', clientId, 'updates'] as const,
    emails: (clientId: string) => ['clients', clientId, 'emails'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    pipeline: ['dashboard', 'pipeline'] as const,
    activity: ['dashboard', 'activity'] as const,
  },
}
