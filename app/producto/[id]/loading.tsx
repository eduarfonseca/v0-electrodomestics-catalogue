// app/producto/[id]/loading.tsx
import React from "react"

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-3 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0 rounded-2xl overflow-hidden w-12 h-12 md:w-20 md:h-20">
                {/* <div
                  className="w-full h-full rounded-2xl animate-pulse"
                  style={{
                    background: "linear-gradient(90deg, var(--color-primary, #FFD4E5), var(--color-sidebar-primary, #BEE4E7))",
                  }}
                /> */}
              </div>

              <div className="space-y-1">
                <div
                  className="h-4 w-44 rounded animate-pulse bg-gray-200 dark:bg-gray-700 animate-pulse"
                  
                />
                <div
                  className="h-3 w-28 rounded animate-pulse bg-gray-200 dark:bg-gray-700 animate-pulse"
                  
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md animate-pulse bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
              <div
                className="h-8 w-20 rounded-md animate-pulse bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="status" aria-live="polite">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="h-10 w-36 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Title / meta skeleton */}
        <div className="mb-6">
          <div className="h-9 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
          <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Image column */}
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-lg overflow-hidden bg-gray-100 relative aspect-square">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>

            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>

          {/* Details column */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
              <div className="h-10 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>

            <div>
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
              <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>

            <section className="pt-4 border-t">
              <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-3 w-3/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            </section>
          </div>
        </div>

        {/* Footer-ish hint */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <svg className="mx-auto mb-2 h-6 w-6 animate-spin" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path>
          </svg>
          Cargando producto... <span className="sr-only"></span>
        </div>
      </main>

      {/* Simple footer skeleton (no client imports) */}
      <footer className="mt-8 border-t border-[color:var(--color-border)/0.08]">
        <div className="container mx-auto px-4 py-8">
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
          <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </footer>
    </div>
  )
}
