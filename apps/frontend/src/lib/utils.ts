import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = new Date(date)
  return isValid(d) ? format(d, 'MMM d, yyyy') : ''
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = new Date(date)
  return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : ''
}

export function timeAgo(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = new Date(date)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : ''
}

export function formatCurrency(amount: number | undefined | null, currency = 'USD'): string {
  if (amount == null) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const LIFECYCLE_STAGES = [
  { stage: 1, name: 'Agreement', icon: '📄' },
  { stage: 2, name: 'Invoice', icon: '💰' },
  { stage: 3, name: 'Welcome Kit', icon: '🚀' },
  { stage: 4, name: 'Access Request', icon: '🔑' },
  { stage: 5, name: 'Kickoff Call', icon: '📞' },
  { stage: 6, name: 'Dashboard Setup', icon: '⚙️' },
  { stage: 7, name: 'Weekly Updates', icon: '📊' },
  { stage: 8, name: 'Monthly Reports', icon: '📈' },
  { stage: 9, name: 'Feedback', icon: '⭐' },
  { stage: 10, name: 'Offboarded', icon: '✅' },
]

export const DOC_TYPES = [
  { type: 'agreement', label: 'Client Service Agreement' },
  { type: 'welcome_kit', label: 'Client Welcome Kit' },
  { type: 'invoice', label: 'Invoice Document' },
  { type: 'access_request', label: 'Access Request Document' },
  { type: 'kickoff', label: 'Kickoff Meeting Brief' },
  { type: 'dashboard', label: 'Client Task Dashboard Summary' },
  { type: 'weekly_update', label: 'Weekly Status Update' },
  { type: 'monthly_report', label: 'Monthly Performance Report' },
  { type: 'feedback', label: 'Feedback & Testimonial Request' },
  { type: 'offboarding', label: 'Offboarding Document' },
] as const

export const SERVICES_LIST = [
  'Social Media Management',
  'Google Ads',
  'Meta Ads',
  'SEO',
  'Content Creation',
  'Email Marketing',
  'Website Development',
  'Branding',
  'Video Production',
  'Influencer Marketing',
]

export function getStageLabel(stage: number): string {
  return LIFECYCLE_STAGES.find((s) => s.stage === stage)?.name ?? `Stage ${stage}`
}

export function getDocLabel(type: string): string {
  return DOC_TYPES.find((d) => d.type === type)?.label ?? type
}
