// Shared TypeScript types

export interface Agency {
  id: string
  name: string
  ownerName: string
  email: string
  phone?: string
  address?: string
  website?: string
  services: string[]
  brandColor: string
  logoUrl?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  agencyId: string
  fullName: string
  businessName: string
  email: string
  phone?: string
  address?: string
  website?: string
  servicesContracted: string[]
  startDate?: string
  contractDuration?: string
  projectScope?: string
  monthlyFee?: number
  paymentTerms?: string
  currency: string
  instagramHandle?: string
  facebookPage?: string
  googleAdsId?: string
  websiteCms?: string
  adAccountId?: string
  meetingPlatform?: string
  calendlyLink?: string
  businessGoals?: string
  targetAudience?: string
  keyMetrics?: string
  reportingFrequency?: string
  lifecycleStage: number
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  latestUpdate?: StatusUpdate
}

export type DocType =
  | 'agreement'
  | 'welcome_kit'
  | 'invoice'
  | 'access_request'
  | 'kickoff'
  | 'dashboard'
  | 'weekly_update'
  | 'monthly_report'
  | 'feedback'
  | 'offboarding'

export type DocStatus = 'draft' | 'generated' | 'sent' | 'acknowledged'

export interface Document {
  id: string
  clientId: string
  agencyId: string
  docType: DocType
  status: DocStatus
  generatedAt?: string
  sentAt?: string
  sentToEmail?: string
  pdfUrl?: string
  pdfExpiresAt?: string
  customData?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface StatusUpdate {
  id: string
  clientId: string
  agencyId: string
  updateType: 'daily' | 'weekly'
  content: string
  nextSteps?: string
  createdAt: string
}

export interface EmailLog {
  id: string
  agencyId: string
  clientId: string
  documentId?: string
  toEmail: string
  subject?: string
  sendgridMessageId?: string
  status: 'sent' | 'failed'
  errorMessage?: string
  sentAt: string
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  docsGeneratedThisMonth: number
  emailsSentThisMonth: number
}

export interface PipelineData {
  stage: number
  stageName: string
  count: number
}

export interface ActivityEvent {
  id: string
  type: 'doc_generated' | 'email_sent' | 'client_added' | 'stage_updated' | 'update_added'
  message: string
  clientName?: string
  timestamp: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ApiError {
  code: string
  message: string
  field?: string
  status: number
}
