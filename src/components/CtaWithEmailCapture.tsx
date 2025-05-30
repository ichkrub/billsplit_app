import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { styleGuide } from '../styles/styleGuide'
import { subscribeEmail } from '../utils/emailSubscription'

interface CtaFormState {
  email: string
  fullname: string // honeypot field
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function CtaWithEmailCapture() {
  const [formState, setFormState] = useState<CtaFormState>({
    email: '',
    fullname: '', // honeypot field
    status: 'idle',
    message: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // If honeypot field is filled, silently succeed
    if (formState.fullname) {
      setFormState(prev => ({
        ...prev,
        status: 'success',
        message: 'Thanks for subscribing!'
      }))
      return
    }

    // Basic email validation
    if (!formState.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      setFormState(prev => ({
        ...prev,
        status: 'error',
        message: 'Please enter a valid email address'
      }))
      return
    }

    setFormState(prev => ({ ...prev, status: 'submitting' }))

    try {
      const { success, message } = await subscribeEmail({
        email: formState.email,
        source: 'main_cta',
        user_agent: navigator.userAgent,
      })

      setFormState(prev => ({
        ...prev,
        status: success ? 'success' : 'error',
        message
      }))
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        status: 'error',
        message: 'Something went wrong. Please try again.'
      }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Ready to split and stay updated?
      </h2>
      <p className="text-white/80 mb-10 text-xl">
        Use BillSplit now — and get notified when we launch new features.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        {/* Honeypot field - hidden from users but visible to bots */}
        <div className="opacity-0 absolute -left-[9999px] -top-[9999px] h-0">
          <label htmlFor="fullname">Do not fill this field</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            tabIndex={-1}
            autoComplete="off"
            value={formState.fullname}
            onChange={e => setFormState(prev => ({ ...prev, fullname: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email (optional)"
                value={formState.email}
                onChange={e => setFormState(prev => ({ 
                  ...prev, 
                  email: e.target.value,
                  status: e.target.value ? 'idle' : prev.status,
                  message: e.target.value ? '' : prev.message
                }))}
                disabled={formState.status === 'submitting'}
                aria-label="Email address"
                className={`w-full ${styleGuide.components.input.base} ${styleGuide.components.input.sizes.lg} border-white/20 bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30 transition-colors`}
              />
              {formState.message && (
                <div className={`absolute left-0 -bottom-6 text-sm ${
                  formState.status === 'success' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {formState.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={formState.status === 'submitting'}
              className={`${styleGuide.components.button.base} ${styleGuide.components.button.sizes.lg} !bg-white !text-primary-800 hover:!bg-white/90 whitespace-nowrap`}
            >
              {formState.status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          <Link
            to="/quicksplit"
            className={`w-full ${styleGuide.components.button.base} ${styleGuide.components.button.sizes.lg} bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:translate-y-[1px]`}
          >
            Try BillSplit Now
          </Link>
        </div>
      </form>
    </div>
  )
}
