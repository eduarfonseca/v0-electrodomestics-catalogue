// app/admin/loading.tsx
"use client"

import React from "react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-52 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6" role="status" aria-live="polite">
        {/* Hero / Search area */}

        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
          <div className="col-span-2">
            <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="col-span-1 flex gap-2">
            <div className="h-12 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-12 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Category pills skeleton */}
        <div className="mb-8 flex flex-row gap-3 sm:justify-center overflow-hidden px-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-full bg-gray-200 dark:bg-gray-700 px-4 py-1 animate-pulse w-[120px]" />
          ))}
        </div>


        {/* Table skeleton */}
        <div className="rounded-lg border-2 overflow-hidden">
          <div className="p-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse" />
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="[&_tr]:border-b">
                  <tr>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <th key={i} className="text-left py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {Array.from({ length: 6 }).map((_, row) => (
                    <tr key={row} className="border-b">
                      {Array.from({ length: 6 }).map((_, col) => (
                        <td key={col} className="p-2 align-middle">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer-ish loading hint */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <svg className="mx-auto mb-2 h-6 w-6 animate-spin" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" />
          </svg>
          Cargando panel de administración... <span className="sr-only">Espere mientras verificamos y cargamos datos</span>
        </div>
      </main>
    </div>
  )
  return null;
}
