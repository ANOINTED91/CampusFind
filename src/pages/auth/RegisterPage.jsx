import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { signUp } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'staff',   label: 'Staff' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validate() {
    const e = {}
    if (!form.fullName.trim())                         e.fullName = 'Full name is required'
    if (!form.email)                                   e.email    = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email))              e.email    = 'Enter a valid email'
    if (!form.phone.trim())                            e.phone    = 'Phone number is required'
    if (!form.password)                                e.password = 'Password is required'
    if (form.password.length < 6)                      e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: form.role })
      toast.success('Account created! Please check your email to confirm.', 'Welcome to CampusFind')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const perks = [
    'Report lost & found items instantly',
    'Get notified about matching items',
    'Secure claim submission process',
    'Free to use for all campus members',
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-16 right-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.2s' }} />
        </div>
        <div className="relative z-10 px-12">
          <div className="flex items-center mb-10">
            <img src="/logo.png" alt="CampusFind Logo" className="h-16 w-auto object-contain filter drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join the Community</h2>
          <p className="text-indigo-200 mb-10 leading-relaxed">
            Over 2,000 students and staff trust CampusFind to manage their lost & found.
          </p>
          <ul className="space-y-4">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-indigo-100">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt="CampusFind Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
            <p className="text-slate-500 text-sm mb-8">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full name */}
              <FormField id="reg-name" label="Full Name" error={errors.fullName}>
                <InputWrapper icon={User}>
                  <input id="reg-name" type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="John Doe" className={inputClass(errors.fullName)}
                    aria-invalid={!!errors.fullName} />
                </InputWrapper>
              </FormField>

              {/* Email */}
              <FormField id="reg-email" label="Email Address" error={errors.email}>
                <InputWrapper icon={Mail}>
                  <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@university.edu" className={inputClass(errors.email)}
                    aria-invalid={!!errors.email} />
                </InputWrapper>
              </FormField>

              {/* Phone */}
              <FormField id="reg-phone" label="Phone Number" error={errors.phone}>
                <InputWrapper icon={Phone}>
                  <input id="reg-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+234 800 000 0000" className={inputClass(errors.phone)}
                    aria-invalid={!!errors.phone} />
                </InputWrapper>
              </FormField>

              {/* Role */}
              <FormField id="reg-role" label="I am a…">
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <label key={r.value} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      form.role === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                      <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                        onChange={e => set('role', e.target.value)} className="sr-only" />
                      {r.label}
                    </label>
                  ))}
                </div>
              </FormField>

              {/* Password */}
              <FormField id="reg-password" label="Password" error={errors.password}>
                <InputWrapper icon={Lock}>
                  <input id="reg-password" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters" className={`${inputClass(errors.password)} pr-12`}
                    aria-invalid={!!errors.password} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputWrapper>
              </FormField>

              {/* Confirm password */}
              <FormField id="reg-confirm-password" label="Confirm Password" error={errors.confirmPassword}>
                <InputWrapper icon={Lock}>
                  <input id="reg-confirm-password" type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password" className={inputClass(errors.confirmPassword)}
                    aria-invalid={!!errors.confirmPassword} />
                </InputWrapper>
              </FormField>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all"
              >
                {loading ? 'Creating account…' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function inputClass(error) {
  return `w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
    error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`
}

function FormField({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function InputWrapper({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
      {children}
    </div>
  )
}
