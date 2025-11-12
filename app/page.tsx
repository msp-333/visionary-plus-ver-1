import Logo from '@/components/Logo'

export default function Page() {
  return (
    <main className="min-h-dvh bg-radial">
      {/* NAV */}
      <header className="container flex items-center justify-between py-4 sm:py-6">
        <Logo size="lg" href="/" />
        <div className="flex items-center gap-2">
          <a href="/login" className="rounded-full border border-v-dark/10 px-4 py-2 text-sm font-medium hover:bg-v-dark/5">
            Sign in
          </a>
          <a href="/signup" className="rounded-full bg-v-ceil px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90">
            Get started
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="container grid grid-cols-1 items-center gap-16 pb-20 pt-10 sm:pb-28 sm:pt-14 md:grid-cols-2">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium shadow-soft backdrop-blur dark:bg-v-dark/70 dark:text-v-white">
            <span className="size-2 rounded-full bg-v-ceil animate-pulse" />
            Better Vision is Possible
          </span>
          <h1 className="mt-4 font-manrope text-4xl font-semibold leading-loose sm:text-5xl md:text-6xl dark:text-v-white">
            Protect and improve
            <span className="block bg-gradient-to-r from-v-ceil to-v-pastel bg-clip-text text-transparent">
              your eyesight
            </span>
          </h1>
          <p className="mt-6 max-w-prose text-balance text-base text-v-dark/70 sm:text-lg dark:text-v-white/70">
            Daily eye exercises, quick vision checks, and a gentle journey to clearer sight.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-v-ceil to-v-pastel px-7 py-4 font-manrope font-semibold text-white shadow-soft transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            >
              Start your journey →
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-v-dark/10 bg-[#fcfdfe] px-7 py-4 font-manrope font-semibold text-v-dark "
            >
              Learn more
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-v-dark/60 dark:text-v-white/60">
            <span className="rounded-full bg-v-dark/5 px-3 py-1.5 dark:bg-v-white/10">No spam</span>
            <span className="rounded-full bg-v-dark/5 px-3 py-1.5 dark:bg-v-white/10">Mobile friendly</span>
            <span className="rounded-full bg-v-dark/5 px-3 py-1.5 dark:bg-v-white/10">Better vision habits</span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative order-first h-64 w-full md:order-none md:h-[30rem]">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-v-ceil/20 to-v-pastel/30 shadow-soft blur-xl animate-pulse-slow" />
          <div className="relative h-full w-full rounded-[2rem] bg-gradient-to-br from-v-ceil/10 to-v-pastel/20 backdrop-blur-sm shadow-soft">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-v-ceil to-v-pastel opacity-30 blur-md animate-ping-slow"></div>
                {/* Main eye shape */}
                <div className="relative h-48 w-48 md:h-56 md:w-56 rounded-full bg-gradient-to-br from-white to-v-white shadow-inner">
                  {/* Iris */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-v-ceil to-v-pastel shadow-lg">
                      {/* Pupil */}
                      <div className="absolute inset-4 rounded-full bg-v-dark/80"></div>
                    </div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute top-8 left-8 h-6 w-6 rounded-full bg-white/80 blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container pt-4 sm:pt-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Daily Micro-Exercises',
              desc: '2–5 minute routines designed with optometrist input to reduce eye strain.',
            },
            {
              title: 'Vision Checks',
              desc: 'Quick tests track focus, contrast, and acuity—see progress over time.',
            },
            {
              title: 'Gentle Motivation',
              desc: 'Streaks, goals, and achievements—encouragement without pressure.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-v-dark/10 bg-white p-5 shadow-soft dark:bg-white"
            >
              {/* force dark text on a white card */}
              <h3 className="font-manrope text-lg font-semibold text-v-dark">{f.title}</h3>
              <p className="mt-2 text-sm text-v-dark/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER on splash */}
      <footer className="border-t border-v-dark/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <Logo size="lg" href="/" />
          <p className="text-xs text-v-dark/60 dark:text-v-white/60">
            © {new Date().getFullYear()} Visionary+. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
