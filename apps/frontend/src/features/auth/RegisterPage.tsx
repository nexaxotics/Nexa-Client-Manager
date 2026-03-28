import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'
import api from '@/lib/api'
import { getApiError } from '@/lib/api'
import { SERVICES_LIST } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string().min(2, 'Agency name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number'),
  phone: z.string().optional(),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  brandColor: z.string().default('#4F46E5'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { services: [], brandColor: '#4F46E5' },
  })

  const selectedServices = watch('services')
  const brandColor = watch('brandColor')

  const toggleService = (svc: string) => {
    const current = selectedServices ?? []
    setValue('services', current.includes(svc) ? current.filter((s) => s !== svc) : [...current, svc])
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      await api.post('/auth/register', data)
      toast.success('Account created! Please check your email to verify your account.')
      navigate('/login')
    } catch (err) {
      const apiError = getApiError(err)
      toast.error(apiError.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-indigo-900 to-indigo-800 flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl">Nexaxotics</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Create your agency</h2>
          <p className="text-neutral-500 text-sm mb-6">Set up your agency profile to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="name">Agency Name *</label>
                <input id="name" className="input" placeholder="Growth Agency" {...register('name')} />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="ownerName">Owner Name *</label>
                <input id="ownerName" className="input" placeholder="John Doe" {...register('ownerName')} />
                {errors.ownerName && <p className="field-error">{errors.ownerName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email Address *</label>
              <input id="reg-email" type="email" className="input" placeholder="you@agency.com" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="reg-password">Password *</label>
                <input id="reg-password" type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" {...register('password')} />
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" type="tel" className="input" placeholder="+1 (555) 000-0000" {...register('phone')} />
              </div>
            </div>

            <div>
              <label className="label">Services Offered *</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SERVICES_LIST.map((svc) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedServices?.includes(svc)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-indigo-400'
                    }`}
                  >
                    {svc}
                  </button>
                ))}
              </div>
              {errors.services && <p className="field-error">{errors.services.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="brandColor">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  id="brandColor"
                  type="color"
                  className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                  {...register('brandColor')}
                />
                <span className="text-sm text-neutral-600 font-mono">{brandColor}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary btn w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
