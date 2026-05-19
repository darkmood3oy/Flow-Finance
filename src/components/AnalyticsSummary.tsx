import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth,
  isWithinInterval 
} from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface AnalyticsSummaryProps {
  transactions: Transaction[];
  currency?: string;
}

export function AnalyticsSummary({ transactions, currency = 'GBP' }: AnalyticsSummaryProps) {
  const calculateTotal = (start: Date, end: Date, type: 'income' | 'expense') => {
    return transactions
      .filter(tx => tx.type === type && isWithinInterval(new Date(tx.date), { start, end }))
      .reduce((acc, tx) => acc + tx.amount, 0);
  };

  const now = new Date();
  
  const stats = [
    {
      label: 'Today',
      expense: calculateTotal(startOfDay(now), endOfDay(now), 'expense'),
      income: calculateTotal(startOfDay(now), endOfDay(now), 'income'),
    },
    {
      label: 'Week',
      expense: calculateTotal(startOfWeek(now), endOfWeek(now), 'expense'),
      income: calculateTotal(startOfWeek(now), endOfWeek(now), 'income'),
    },
    {
      label: 'Month',
      expense: calculateTotal(startOfMonth(now), endOfMonth(now), 'expense'),
      income: calculateTotal(startOfMonth(now), endOfMonth(now), 'income'),
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-8">
       <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Metrics</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="frosted-card !p-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{stat.label}</span>
             <div className="space-y-1">
               <div className="text-xs font-mono font-bold text-red-500">-{formatCurrency(stat.expense, currency)}</div>
               <div className="text-xs font-mono font-bold text-brand-success">+{formatCurrency(stat.income, currency)}</div>
             </div>
             <div className="mt-3 pt-3 border-t border-white/20">
               <div className={cn(
                 "text-sm font-bold font-mono",
                 stat.income - stat.expense >= 0 ? "text-slate-800" : "text-red-600"
               )}>
                 {formatCurrency(stat.income - stat.expense, currency)}
               </div>
               <div className="text-[8px] text-slate-400 uppercase font-bold">Net Flow</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
