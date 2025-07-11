"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function StatSnippet() {
  return (
    <section className="py-24 bg-background/50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-2xl"
        >
          <Link href="/game-logs/20231205-phx" className="group">
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">December 5, 2023</p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    6 Blocks vs Phoenix Suns
                  </h3>
                  <p className="text-muted-foreground">
                    AD dominated the paint, leading Lakers to a 106-103 victory
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 