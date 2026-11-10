import React from 'react'

const LoginLeft = () => {
  return (
    <section className="relative flex min-h-screen overflow-hidden text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-between px-8 py-9 sm:px-12 sm:py-12 lg:px-16">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            className="size-10"
          />
          <span className="text-lg font-semibold tracking-tight">Ignited Minds</span>
        </div>

        <div className="max-w-xl py-20">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
            Your next idea starts here
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Turn your ideas into something real.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg animate-pulse">
            A space to imagine, build, and bring your next project to life.
          </p>
        </div>

        <p className="text-sm text-white/65">
          Make room for what you want to build.
        </p>
      </div>
    </section>
  )
}

export default LoginLeft
