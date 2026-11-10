import React, { useEffect, useState } from 'react'
import {
  ArrowUp,
  ChevronDown,
  CirclePlus,
  Clock3,
  LoaderCircle,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import { UseAppContext } from '../context/AppContext'
import PricingModal from '../components/PricingModal'

const promptIdeas = [
  'Portfolio Website',
  'E-commerce Website',
  'Blog',
  'Landing Page',
  'Resume Website',
]

const HomePage = () => {
  const [prompt, setPrompt] = useState('')
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [creatingProject, setCreatingProject] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const { user, setUser, setIsUpgradeModalOpen } = UseAppContext()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data } = await api.get('/api/projects')
        setProjects(data)
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          'Could not load your projects. Please refresh to try again.'
        )
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [])

  const createProject = async (event) => {
    event.preventDefault()
    const projectPrompt = prompt.trim()
    if (!projectPrompt || creatingProject) return

    if (user?.credits !== undefined && user.credits <= 0) {
      setError('You have exhausted your generation credits. Please upgrade your plan!')
      setIsUpgradeModalOpen(true)
      return
    }

    setError('')
    setCreatingProject(true)
    try {
      const { data } = await api.post('/api/projects', { prompt: projectPrompt })
      if (!data?._id) {
        throw new Error('The project was created without an ID.')
      }
      navigate(`/builder/${data._id}`)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/login')
        return
      }
      if (requestError.response?.data?.needsUpgrade) {
        setIsUpgradeModalOpen(true)
      }
      setError(
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        requestError.message ||
        'Could not create your project. Please try again.'
      )
    } finally {
      setCreatingProject(false)
    }
  }

  const signOut = async () => {
    setError('')
    setSigningOut(true)
    try {
      await api.post('/api/auth/logout')
      setUser(null)
      localStorage.removeItem('token')
      navigate('/login')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        'Could not sign out. Please try again.'
      )
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-white bg-stone-900">
      <PricingModal />
      {/* Background image from public folder */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      />
      {/* Darkened stone-600 tone overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-stone-100/20 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-black/60 backdrop-blur-[1px]"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Ignited Minds home">
          <img src="/logo.svg" alt="" aria-hidden="true" className="size-8" />
          <span className="text-sm font-semibold tracking-tight sm:text-base">Ignited Minds</span>
        </a>

        <div className="flex items-center gap-3">
          {/* Subtle credits indicator */}
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
            type="button"
            title="Click to upgrade or view plans"
          >
            <span>{user?.credits ?? 20} credits</span>
          </button>

          <span className="hidden max-w-40 truncate text-sm text-white/75 sm:inline">
            {user?.name || user?.email || 'Your account'}
          </span>
          <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            disabled={signingOut}
            onClick={signOut}
            type="button"
          >
            {signingOut ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={15} />
            ) : (
              <LogOut aria-hidden="true" size={15} />
            )}
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-14 pt-16 text-center sm:px-8 sm:pt-20 lg:pt-24">
        <div 
          onClick={() => setIsUpgradeModalOpen(true)}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 shadow-lg shadow-black/10 backdrop-blur hover:bg-white/15 transition"
        >
          <span className="animate-pulse rounded-full bg-red-500 p-1.5 text-[10px] font-bold uppercase tracking-wide">
            New
          </span>
          Create your first project for free
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Let&apos;s build your app
          <br className="hidden sm:block" /> together
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
          Describe your idea and watch AI design, structure, and launch your website
          instantly. No coding required.
        </p>

        <form
          className="mt-9 w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-2 text-left shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-white/35 focus-within:bg-white/[0.13]"
          onSubmit={createProject}
        >
          <label className="sr-only" htmlFor="project-prompt">
            Describe the website you want to build
          </label>
          <textarea
            className="min-h-24 w-full resize-y bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/50 sm:min-h-28 sm:px-4"
            id="project-prompt"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the website you want to create..."
            required
            value={prompt}
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="px-2 text-xs text-white/45">Be as specific as you like</span>
            <button
              aria-label="Create project"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl bg-white text-rose-700 transition hover:scale-105 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              disabled={creatingProject || !prompt.trim()}
              type="submit"
            >
              {creatingProject ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              ) : (
                <ArrowUp aria-hidden="true" size={19} />
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
          {promptIdeas.map((idea) => (
            <button
              className="cursor-pointer rounded-full border border-white/20 bg-white/[0.07] px-3.5 py-2 text-xs text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white sm:text-sm"
              key={idea}
              onClick={() => setPrompt(`Create a ${idea.toLowerCase()} for `)}
              type="button"
            >
              {idea}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
        <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            Your projects
          </h2>
          <span className="text-xs text-white/60">
            {loadingProjects ? 'Loading...' : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </span>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200/20 bg-red-950/30 px-4 py-3 text-sm text-white" role="alert">
            {error}
          </p>
        )}

        {loadingProjects ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/65">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            Loading your projects
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <button
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/15 bg-black/10 px-4 py-4 text-left transition hover:border-white/30 hover:bg-white/10"
                key={project._id}
                onClick={() => navigate(`/builder/${project._id}`)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white/95">
                    {project.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-white/55">
                    <Clock3 aria-hidden="true" size={12} />
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : 'Recently updated'}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="-rotate-90 text-white/45 transition group-hover:translate-x-0.5 group-hover:text-white"
                  size={17}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/20 bg-black/5 px-6 py-10 text-center">
            <CirclePlus aria-hidden="true" className="mb-3 text-white/60" size={24} />
            <p className="text-sm font-medium text-white/85">Your next project starts with an idea</p>
            <p className="mt-1 text-xs text-white/55">Describe it above and we&apos;ll help you build it.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage
