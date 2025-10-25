"use client";

import React from "react";

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--color-primary, #FFD4E5) 4%, transparent), color-mix(in srgb, var(--color-sidebar-primary, #BEE4E7) 4%, transparent) 50%, color-mix(in srgb, var(--color-sidebar-accent, #F7CCAD) 4%, transparent) 100%)",
      }}
      aria-hidden={false}
    >
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
                  className="h-4 w-44 rounded animate-pulse"
                  style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
                />
                <div
                  className="h-3 w-28 rounded animate-pulse"
                  style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md animate-pulse"
                style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
                aria-hidden
              />
              <div
                className="h-8 w-20 rounded-md animate-pulse"
                style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8" role="status" aria-live="polite">
        {/* Hero / Search area */}
        <div className="text-center mb-8">
          <div className="mx-auto max-w-2xl">
            <div
              className="h-8 rounded w-3/4 mx-auto mb-3 animate-pulse"
              style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
            />
            <div
              className="h-4 rounded w-1/2 mx-auto animate-pulse"
              style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
          <div className="col-span-2">
            <div
              className="h-12 rounded-lg animate-pulse"
              style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
            />
          </div>
          <div className="col-span-1 flex gap-2">
            <div
              className="h-12 flex-1 rounded-lg animate-pulse"
              style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
            />
            <div
              className="h-12 w-16 rounded-lg animate-pulse"
              style={{ background: "var(--color-muted, rgba(0,0,0,0.06))" }}
            />
          </div>
        </div>

        {/* Category pills skeleton */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-full bg-gray-200 dark:bg-gray-700 px-4 py-1 animate-pulse w-[120px]" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <article
              key={i}
              className="rounded-lg border-2 overflow-hidden p-0 bg-card"
              aria-hidden
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#FFD4E5]/20 to-[#BEE4E7]/20">
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>

              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3 animate-pulse" />

                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-8 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-8 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state hint when no products (still loading so we show hint) */}
        <div className="text-center py-8">
          <div className="mx-auto max-w-md">
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-2" />
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Dialog/modal placeholder */}
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>

        {/* Footer-ish loading hint */}
        <div className="mt-8 text-center text-sm text-muted-foreground" aria-hidden={false}>
          <svg
            className="mx-auto mb-2 h-6 w-6 animate-spin"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              fill="currentColor"
            />
          </svg>

          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">Cargando catálogo...</span>
            <span className="sr-only">Espere mientras cargamos los productos</span>
          </div>
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
  );
}
