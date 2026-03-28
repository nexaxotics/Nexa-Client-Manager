import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import api from '@/lib/api'
import { getApiError } from '@/lib/api'
import { SERVICES_LIST } from '@/lib/utils'
import { cn } from '@/lib/utils'

const step1Schema = z.object({
  fullName: z.string().min(2, 'Required'),
  businessName: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
})

const step2Schema = z.object({
  servicesContracted: z.array(z.string()).min(1, 'Select at least one service'),
  startDate: z.string().optional(),
  contractDuration: z.string().optional(),
  projectScope: z.string().optional(),
  monthlyFee: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().default('USD'),
})

const step3Schema = z.object({
  instagramHandle: z.string().optional(),
  facebookPage: z.string().optional(),
  googleAdsId: z.string().optional(),
  websiteCms: z.string().optional(),
  adAccountId: z.string().optional(),
  meetingPlatform: z.string().optional(),
  calendlyLink: z.string().optional(),
  businessGoals: z.string().optional(),
  targetAudience: z.string().optional(),
  keyMetrics: z.string().optional(),
  reportingFrequency: z.string().default('monthly'),
})

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)
type FormData = z.infer<typeof fullSchema>

const STEPS = ['Client Info', 'Service Details', 'Access & Goals']

export default function NewClientPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: { servicesContracted: [], currency: 'USD', reportingFrequency: 'monthly' },
  })

  const servicesContracted = watch('servicesContracted')

  const toggleService = (svc: string) => {
    const curr = servicesContracted ?? []
    setValue('servicesContracted', curr.includes(svc) ? curr.filter((s) => s !== svc) : [...curr, svc])
  }

  const nextStep = async () => {
    const fieldsToValidate = step === 0
      ? ['fullName', 'businessName', 'email']
      : step === 1
      ? ['servicesContracted']
      : []
    const valid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0])
    if (valid) setStep((s) => Math.min(s + 1, 2))
  }

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        monthlyFee: data.monthlyFee ? Number(data.monthlyFee) : undefined,
      }
      const res = await api.post('/clients', payload)
      toast.success('Client added successfully!')
      navigate(`/clients/${res.data.data.id}`)
    } catch (err) {
      toast.error(getApiError(err).message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
              i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-neutral-200 text-neutral-500'
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn('text-sm hidden sm:block', i <= step ? 'text-neutral-900 font-medium' : 'text-neutral-400')}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-indigo-600' : 'bg-neutral-200')} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card space-y-4">
          {/* Step 1: Client Info */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Jane Smith" {...register('fullName')} />
                  {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="label">Business Name *</label>
                  <input className="input" placeholder="Acme Corp" {...register('businessName')} />
                  {errors.businessName && <p className="field-error">{errors.businessName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="jane@acme.com" {...register('email')} />
                  {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="+1 (555) 000-0000" {...register('phone')} />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" placeholder="123 Main St, City, State" {...register('address')} />
              </div>
              <div>
                <label className="label">Website</label>
                <input type="url" className="input" placeholder="https://acme.com" {...register('website')} />
              </div>
            </>
          )}

          {/* Step 2: Service Details */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Service Details</h2>
              <div>
                <label className="label">Services Contracted *</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SERVICES_LIST.map((svc) => (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                        servicesContracted?.includes(svc)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-neutral-600 border-neutral-300 hover:border-indigo-400'
                      )}
                    >
                      {svc}
                    </button>
                  ))}
                </div>
                {errors.servicesContracted && <p className="field-error">{errors.servicesContracted.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input" {...register('startDate')} />
                </div>
                <div>
                  <label className="label">Contract Duration</label>
                  <input className="input" placeholder="6 months" {...register('contractDuration')} />
                </div>
              </div>
              <div>
                <label className="label">Project Scope</label>
                <textarea rows={3} className="input resize-none" placeholder="Describe the project scope..." {...register('projectScope')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Monthly Fee</label>
                  <input type="number" className="input" placeholder="5000" {...register('monthlyFee')} />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" {...register('currency')}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Terms</label>
                  <input className="input" placeholder="Net 30" {...register('paymentTerms')} />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Access & Goals */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Access & Goals</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Instagram Handle</label>
                  <input className="input" placeholder="@acmecorp" {...register('instagramHandle')} />
                </div>
                <div>
                  <label className="label">Facebook Page</label>
                  <input className="input" placeholder="facebook.com/acme" {...register('facebookPage')} />
                </div>
                <div>
                  <label className="label">Google Ads ID</label>
                  <input className="input" placeholder="000-000-0000" {...register('googleAdsId')} />
                </div>
                <div>
                  <label className="label">Website CMS</label>
                  <input className="input" placeholder="WordPress, Shopify..." {...register('websiteCms')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Meeting Platform</label>
                  <input className="input" placeholder="Google Meet, Zoom..." {...register('meetingPlatform')} />
                </div>
                <div>
                  <label className="label">Reporting Frequency</label>
                  <select className="input" {...register('reportingFrequency')}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Business Goals</label>
                <textarea rows={2} className="input resize-none" placeholder="What are their main business goals?" {...register('businessGoals')} />
              </div>
              <div>
                <label className="label">Target Audience</label>
                <textarea rows={2} className="input resize-none" placeholder="Describe their ideal customer..." {...register('targetAudience')} />
              </div>
              <div>
                <label className="label">Key Metrics to Track</label>
                <input className="input" placeholder="ROAS, CPL, Engagement Rate..." {...register('keyMetrics')} />
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            className="btn-secondary btn"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {step < 2 ? (
            <button type="button" className="btn-primary btn" onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" className="btn-primary btn" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
