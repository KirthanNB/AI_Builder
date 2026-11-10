import React, { useState } from 'react'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import LoginLeft from '../components/LoginLeft'
import { UseAppContext } from '../context/AppContext'

const AuthPage = ({ mode }) => {
  const [islogin, setIsLogin] = useState(mode !== 'register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showpass, setShowpass] = useState(false)
  const [error, setError] = useState('')
  const [loader, setLoader] = useState(false)
  const { setUser } = UseAppContext()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoader(true)

    try {
      const endpoint = islogin ? '/api/auth/login' : '/api/auth/register'
      const credentials = islogin ? { email, password } : { name, email, password }
      const { data } = await api.post(endpoint, credentials)

      if (!data?.user) {
        throw new Error('Authentication response did not include a user.')
      }

      if (data?.token) {
        localStorage.setItem('token', data.token)
      }

      setUser(data.user)
      navigate('/')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        requestError.message ||
        'Unable to complete your request. Please try again.'
      )
    } finally {
      setLoader(false)
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-black/50" />

      <div className="relative z-10 hidden lg:block">
        <LoginLeft />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden">
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/45 bg-gradient-to-br from-white/35 via-rose-50/20 to-pink-100/25 p-7 font-sans shadow-xl shadow-rose-950/10 backdrop-blur-xl sm:p-10">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-shadow-white">
              Ignited Minds
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-100 sm:text-4xl">
              {islogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white">
              {islogin
                ? 'Sign in to continue building your next big idea.'
                : 'Get started and bring your next idea to life.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!islogin && (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-900">
                  Full name
                </label>
                <input
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/60 bg-white/55 px-4 py-3 text-stone-900 outline-none backdrop-blur-sm transition placeholder:text-stone-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/70"
                  id="name"
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  type="text"
                  value={name}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-900">
                Email address
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/60 bg-white/55 px-4 py-3 text-stone-900 outline-none backdrop-blur-sm transition placeholder:text-stone-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/70"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-900">
                Password
              </label>
              <div className="relative">
                <input
                  autoComplete={islogin ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-white/60 bg-white/55 px-4 py-3 pr-12 text-stone-900 outline-none backdrop-blur-sm transition placeholder:text-stone-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/70"
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showpass ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showpass ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-stone-900 transition hover:text-stone-700"
                  onClick={() => setShowpass((visible) => !visible)}
                  type="button"
                >
                  {showpass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loader}
              type="submit"
            >
              {loader && <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />}
              {loader ? 'Please wait...' : islogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-900">
            {islogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="cursor-pointer font-semibold text-rose-700 transition hover:text-rose-800"
              onClick={() => {
                setIsLogin((current) => !current)
                setError('')
              }}
              type="button"
            >
              {islogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
