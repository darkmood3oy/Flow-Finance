import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '@/src/lib/utils';

interface HeroMetricProps {
  safeToSpend: number;
  dailyBudget: number;
}

export function HeroMetric({ safeToSpend, dailyBudget }: HeroMetricProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <span className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em] mb-4 block">Safe to Spend Today</span>
        <div className="relative">
          <motion.h1 
            key={safeToSpend}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="safe-to-spend-text"
          >
            £{Math.floor(safeToSpend)}<span className="opacity-30 text-[80px] font-extralight italic">.{String(Math.round((safeToSpend % 1) * 100)).padStart(2, '0')}</span>
          </motion.h1>
        </div>
        
        <p className="mt-6 text-slate-500 max-w-sm text-center leading-relaxed font-medium mx-auto">
          Current daily limit: <span className="text-slate-800 font-bold">{formatCurrency(dailyBudget)}</span>
        </p>
      </motion.div>
    </div>
  );
}
