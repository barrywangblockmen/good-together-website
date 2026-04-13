"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SITE_TAGLINE } from "@/lib/constants";

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b border-edge mesh-bg">
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            台灣共好交流協會
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted md:text-2xl">
            一起走更遠。連結 AI、Web3、永續發展的專業社群，
            <br className="hidden md:block" />
            共創成長、共享價值。
          </p>
          <p className="mt-4 text-sm font-medium text-primary">{SITE_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/about" variant="primary">
              認識協會
            </Button>
            <Button href="/join" variant="outline">
              填寫表單
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
