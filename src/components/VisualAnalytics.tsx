import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  isWithinInterval, format,
  eachDayOfInterval, eachMonthOfInterval,
  subDays, subMonths
} from 'date-fns';
import { formatCurrency, cn } from '@/src/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface VisualAnalyticsProps {
  transactions: Transaction[];
  currency?: string;
}

type Period = 'day' | 'week' | 'month' | 'year';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export function VisualAnalytics({ transactions, currency = 'GBP' }: VisualAnalyticsProps) {
  const [period, setPeriod] = useState<Period>('week');

  const { filteredTransactions, dateRange, intervalLabel } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let label: string;

    switch (period) {
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        label = format(now, 'MMMM d, yyyy');
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        label = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        label = format(now, 'MMMM yyyy');
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        label = format(now, 'yyyy');
        break;
    }

    const filtered = transactions.filter(tx => 
      isWithinInterval(new Date(tx.date), { start, end })
    );

    return { filteredTransactions: filtered, dateRange: { start, end }, intervalLabel: label };
  }, [transactions, period]);

  const metrics = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const expense = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const savings = income - expense;
    const burnRate = income > 0 ? (expense / income) * 100 : 100;
    return { income, expense, savings, burnRate };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(tx => tx.type === 'expense');
    const grouped = expenses.reduce((acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const trendData = useMemo(() => {
    if (period === 'year') {
      const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      return months.map(m => {
        const mStart = startOfMonth(m);
        const mEnd = endOfMonth(m);
        const inc = filteredTransactions
          .filter(tx => tx.type === 'income' && isWithinInterval(new Date(tx.date), { start: mStart, end: mEnd }))
          .reduce((acc, tx) => acc + tx.amount, 0);
        const exp = filteredTransactions
          .filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start: mStart, end: mEnd }))
          .reduce((acc, tx) => acc + tx.amount, 0);
        return { name: format(m, 'MMM'), income: inc, expense: exp };
      });
    }

    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map(d => {
      const dStart = startOfDay(d);
      const dEnd = endOfDay(d);
      const inc = filteredTransactions
        .filter(tx => tx.type === 'income' && isWithinInterval(new Date(tx.date), { start: dStart, end: dEnd }))
        .reduce((acc, tx) => acc + tx.amount, 0);
      const exp = filteredTransactions
        .filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start: dStart, end: dEnd }))
        .reduce((acc, tx) => acc + tx.amount, 0);
      return { 
        name: period === 'month' ? format(d, 'd') : format(d, 'EEE'), 
        income: inc, 
        expense: exp 
      };
    });
  }, [filteredTransactions, period, dateRange]);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 mt-12 mb-32 space-y-12">
      {/* Analytics Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        <div className="space-y-2 text-center lg:text-left">
           <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Insights</h3>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
             Intelligence Hub
           </h1>
           <p className="text-slate-400 text-sm font-medium">{intervalLabel}</p>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner self-end lg:justify-self-end mx-auto lg:mx-0">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                period === p 
                  ? "bg-white text-slate-900 shadow-xl" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricTile 
          label="Inflow Velocity" 
          amount={metrics.income} 
          type="income" 
          currency={currency}
          footer={`${filteredTransactions.filter(tx => tx.type === 'income').length} entries captured`}
        />
        <MetricTile 
          label="Outflow Delta" 
          amount={metrics.expense} 
          type="expense" 
          currency={currency}
          footer={`${Math.round(metrics.burnRate)}% of total income`}
        />
        <MetricTile 
          label="Retained Capital" 
          amount={metrics.savings} 
          type="savings" 
          currency={currency}
          footer={`${metrics.savings >= 0 ? '+' : ''}${formatCurrency(Math.abs(metrics.savings), currency)} balance`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Visualization */}
        <div className="lg:col-span-2 frosted-card !p-10 h-[450px] flex flex-col bg-white border border-slate-100 shadow-2xl shadow-slate-200/40">
           <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
              <div className="space-y-1 text-center sm:text-left">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Analysis</h4>
                 <div className="text-xl font-black text-slate-900 tracking-tight">Flow Convergence</div>
              </div>
              <div className="flex gap-6">
                 <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Gross Profit</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">{formatCurrency(metrics.income, currency)}</span>
                 </div>
                 <div className="flex flex-col items-center sm:items-end border-l border-slate-100 pl-6">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Operating Loss</span>
                    <span className="text-xs font-mono font-bold text-red-500">{formatCurrency(metrics.expense, currency)}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 w-full -ml-8">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#334155" stopOpacity={0.1}/ >
                      <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#CBD5E1' }}
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      color: 'white',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '12px', color: 'white', fontWeight: '900', marginBottom: '8px' }}
                  />
                  <Area type="stepBefore" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={4} />
                  <Area type="stepBefore" dataKey="expense" stroke="#334155" fillOpacity={1} fill="url(#colorExp)" strokeWidth={4} />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Categories Analysis */}
        <div className="frosted-card !p-10 flex flex-col bg-white border border-slate-100 shadow-2xl shadow-slate-200/40">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Sector Allocation</h4>
           
           <div className="space-y-8 flex-1">
              {categoryData.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-widest">No sector data</span>
                </div>
              ) : (
                categoryData.map((cat, idx) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{cat.name}</span>
                       <span className="text-[10px] font-mono font-bold text-slate-400">{formatCurrency(cat.value, currency)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(cat.value / metrics.expense) * 100}%` }}
                         className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                         style={{ opacity: 1 - (idx * 0.15) }}
                       />
                    </div>
                  </div>
                ))
              )}
           </div>

           <div className="mt-auto pt-10 border-t border-slate-50">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Burden</div>
                    <div className="text-sm font-bold text-slate-800 uppercase">{categoryData[0]?.name || 'N/A'}</div>
                 </div>
                 <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">
                   {categoryData.length > 0 ? Math.round((categoryData[0].value / metrics.expense) * 100) : 0}%
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, amount, type, currency, footer }: { label: string, amount: number, type: 'income' | 'expense' | 'savings', currency: string, footer: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col gap-6"
    >
       <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <div className={cn(
            "w-2 h-2 rounded-full",
            type === 'income' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
            type === 'expense' ? "bg-red-500 shadow-[0_0_8_rgba(239,68,68,0.5)]" : "bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.5)]"
          )} />
       </div>
       <div className="space-y-1">
          <div className={cn(
            "text-3xl font-mono font-bold tracking-tighter",
            type === 'income' ? "text-slate-900" : 
            type === 'expense' ? "text-slate-900" : 
            amount >= 0 ? "text-slate-900" : "text-red-500"
          )}>
            {formatCurrency(Math.abs(amount), currency)}
          </div>
          <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-3 mt-3">
            {footer}
          </div>
       </div>
    </motion.div>
  );
}
