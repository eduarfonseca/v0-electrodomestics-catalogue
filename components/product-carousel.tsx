"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  alt?: string;
  aspectClass?: string; // p.e. "aspect-[3/4]" o "aspect-square"
  autoplay?: boolean;
  intervalMs?: number;
  showControls?: boolean;
  showIndicators?: boolean;
};

export default function ProductCarousel({
  images,
  alt = "Imagen del producto",
  aspectClass = "aspect-[3/4]",
  autoplay = true,
  intervalMs = 3000,
  showControls = true,
  showIndicators = true,
}: Props) {
  const imgs = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // touch support
  const touchStartX = useRef<number | null>(null);
  const touchMoved = useRef(false);

  const next = () => setIndex((i) => (imgs.length ? (i + 1) % imgs.length : 0));
  const prev = () => setIndex((i) => (imgs.length ? (i - 1 + imgs.length) % imgs.length : 0));
  const goTo = (i: number) => setIndex(Math.max(0, Math.min(imgs.length - 1, i)));

  useEffect(() => {
    if (!autoplay || imgs.length <= 1) return;
    // start timer
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (imgs.length ? (i + 1) % imgs.length : 0));
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, intervalMs, imgs.length]);

  // pause on hover / focus
  const pause = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const resume = () => {
    if (!autoplay || imgs.length <= 1) return;
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (imgs.length ? (i + 1) % imgs.length : 0));
    }, intervalMs);
  };

  // touch handlers
  const onTouchStart: React.TouchEventHandler = (e) => {
    touchMoved.current = false;
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    pause();
  };
  const onTouchMove: React.TouchEventHandler = (e) => {
    touchMoved.current = true;
  };
  const onTouchEnd: React.TouchEventHandler = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current != null && endX != null) {
      const delta = endX - touchStartX.current;
      const threshold = 40;
      if (Math.abs(delta) > threshold) {
        if (delta < 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    // small delay before resuming autoplay to avoid immediate slide
    setTimeout(resume, 220);
  };

  if (!imgs.length) {
    return (
      <div className={`${aspectClass} rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center`}>
        <span className="text-sm text-muted-foreground">Sin imagen</span>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${aspectClass} rounded-lg overflow-hidden bg-gray-50`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="w-full h-full relative">
        {imgs.map((src, i) => {
          const isActive = i === index;
          return (
            <img
              key={i}
              src={src}
              alt={`${alt} ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              loading={i === index ? "eager" : "lazy"}
              draggable={false}
            />
          );
        })}
      </div>

      {/* Controls */}
      {showControls && imgs.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={(e) => { e.stopPropagation(); prev(); pause(); setTimeout(resume, 400); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-md hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <button
            type="button"
            aria-label="Siguiente"
            onClick={(e) => { e.stopPropagation(); next(); pause(); setTimeout(resume, 400); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-md hover:bg-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && imgs.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-20 flex gap-2 dark:text-black">
          {imgs.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir a la imagen ${i + 1}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); pause(); setTimeout(resume, 400); }}
              className={`w-2 h-2 rounded-full dark:text-black ${i === index ? "bg-black " : "bg-white/70 border border-white/40"}`}
              title={`Imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
