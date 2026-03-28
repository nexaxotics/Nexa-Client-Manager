import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { getApiError } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Agency } from '@/types'
import { SERVICES_LIST } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Required'),
  ownerName: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  services: z.array(z.string()),
  brandColor: z.string(),
})

type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const { agency, setAgency } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: queryKeys.agency.me,
    queryFn: async () => {
      const res = await api.get('/agency/me')
      return res.data.data as Agency
    },
    initialData: agency ?? undefined,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      ownerName: profile?.ownerName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      website: profile?.website ?? '',
      services: profile?.services ?? [],
      brandColor: profile?.brandColor ?? '#4F46E5',
    },
    values: profile
      ? {
          name: profile.name,
          ownerName: profile.ownerName,
          email: profile.email,
          phone: profile.phone ?? '',
          address: profile.address ?? '',
          website: profile.website ?? '',
          services: profile.services,
          brandColor: profile.brandColor,
        }
      : undefined,
  })

  const services = watch('services')
  const brandColor = watch('brandColor')

  const toggleService = (svc: string) => {
    const curr = services ?? []
    setValue('services', curr.includes(svc) ? curr.filter((s) => s !== svc) : [...curr, svc])
  }

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.patch('/agency/me', data),
    onSuccess: (res) => {
      setAgency(res.data.data)
      queryClient.invalidateQueries({ queryKey: queryKeys.agency.me })
      toast.success('Settings saved!')
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  const onSubmit = (data: FormData) => updateMutation.mutate(data)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Agency Settings</h2>
        <p className="text-neutral-500 text-sm mt-1">Update your agency profile and branding</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card space-y-4">
          <h3 className="font-semibold text-neutral-800">Agency Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Agency Name</label>
              <input className="input" {...register('name')} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Owner Name</label>
              <input className="input" {...register('ownerName')} />
              {errors.ownerName && <p className="field-error">{errors.ownerName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" {...register('email')} />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input" {...register('phone')} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" {...register('address')} />
          </div>
          <div>
            <label className="label">Website</label>
            <input type="url" className="input" placeholder="https://..." {...register('website')} />
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-neutral-800">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICES_LIST.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => toggleService(svc)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  services?.includes(svc)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-indigo-400'
                )}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-neutral-800">Branding</h3>
          <div>
            <label className="label">Brand Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                className="w-12 h-12 rounded-xl border border-neutral-300 cursor-pointer p-1"
                {...register('brandColor')}
              />
              <div>
                <p className="text-sm font-mono text-neutral-700">{brandColor}</p>
                <p className="text-xs text-neutral-400">Used in document headers and sidebar avatar</p>
              </div>
            </div>
          </div>
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: brandColor + '20', borderLeft: `4px solid ${brandColor}` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: brandColor }}
            >
              {profile?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: brandColor }}>{profile?.name ?? 'Your Agency'}</p>
              <p className="text-xs text-neutral-500">Preview of your branded element</p>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary btn w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
