import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { getApiError } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', data)
    } catch (err) {
      const apiError = getApiError(err)
      // Don't reveal if email exists, still show success
      if (apiError.status !== 404) {
        toast.error(apiError.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-indigo-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl">Nexaxotics</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Check your email</h2>
              <p className="text-neutral-500 text-sm">
                If an account exists for that email, we&apos;ve sent a password reset link. It expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">Reset password</h2>
              <p className="text-neutral-500 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label" htmlFor="fp-email">Email address</label>
                  <input
                    id="fp-email"
                    type="email"
                    className="input"
                    placeholder="you@agency.com"
                    {...register('email')}
                  />
                  {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>

                <button type="submit" className="btn-primary btn w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
