import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertTriangle, CheckCircle2, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: string;
}

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  category: string;
  date: string;
}

interface BudgetSectionProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  currency?: string;
  onSetBudget: (categoryId: string, limit: number) => Promise<void>;
}

export function BudgetSection({ budgets, categories, transactions, currency = 'GBP', onSetBudget }: BudgetSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [limit, setLimit] = useState('');

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const budgetStats = useMemo(() => {
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(tx => 
          tx.type === 'expense' && 
          tx.categoryId === budget.categoryId && 
          isWithinInterval(new Date(tx.date), { start: currentMonthStart, end: currentMonthEnd })
        )
        .reduce((acc, tx) => acc + tx.amount, 0);
      
      const percentage = (spent / budget.limit) * 100;
      return { 
        ...budget, 
        categoryName: category?.name || 'Unknown', 
        spent, 
        percentage 
      };
    });
  }, [budgets, categories, transactions, currentMonthStart, currentMonthEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !limit) return;
    await onSetBudget(selectedCat, Number(limit));
    setIsAdding(false);
    setSelectedCat('');
    setLimit('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-12 mb-24">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Sentinels</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-brand-primary flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Set Goal
        </button>
      </div>

      <div className="space-y-4">
        {budgetStats.map((stat) => (
          <motion.div
            key={stat.id}
            layout
            className="frosted-card !p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center",
                  stat.percentage > 100 ? "bg-red-500/10 text-red-500" : 
                  stat.percentage > 80 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{stat.categoryName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Limit: {formatCurrency(stat.limit, currency)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-lg font-mono font-bold",
                  stat.percentage > 90 ? "text-red-500" : "text-slate-800"
                )}>
                  {Math.round(stat.percentage)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, stat.percentage)}%` }}
                className={cn(
                  "h-full transition-colors",
                  stat.percentage > 100 ? "bg-red-500" : 
                  stat.percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {stat.percentage > 100 ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    OVER LIMIT
                  </div>
                ) : stat.percentage > 80 ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    THRESHOLD REACHED
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    ON TRACK
                  </div>
                )}
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {formatCurrency(stat.spent, currency)} / {formatCurrency(stat.limit, currency)}
              </span>
            </div>
          </motion.div>
        ))}

        {budgetStats.length === 0 && !isAdding && (
          <div className="py-12 text-center text-slate-400 font-medium bg-white/40 border border-white/40 rounded-3xl border-dashed">
            No budget goals set yet.
          </div>
        )}

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden frosted-card !p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="w-full bg-white/80 border border-white p-3 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-bold appearance-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Limit</label>
                  <input 
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-white/80 border border-white p-3 rounded-2xl outline-none focus:border-brand-primary transition-colors text-xl font-mono font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-3 rounded-2xl font-bold bg-slate-100 text-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-2xl font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Set Budget
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
