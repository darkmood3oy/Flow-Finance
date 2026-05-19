import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Printer, Share2, ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { formatCurrency, cn, shareToWhatsApp, shareContent } from '@/src/lib/utils';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  accountId: string;
}

interface StatementGeneratorProps {
  transactions: Transaction[];
  currency: string;
  userName?: string | null;
  onBack: () => void;
}

export function StatementGenerator({ transactions, currency, userName, onBack }: StatementGeneratorProps) {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  const last6Months = useMemo(() => {
    return eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    }).reverse();
  }, []);

  const monthTransactions = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    return monthTransactions.reduce((acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [monthTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppStatement = () => {
    const text = `📄 *Monthly Financial Statement - ${format(selectedMonth, 'MMMM yyyy')}*\n\n*Summary:*\nIncome: ${formatCurrency(summary.income, currency)}\nExpenses: ${formatCurrency(summary.expense, currency)}\nNet Flow: ${formatCurrency(summary.income - summary.expense, currency)}\n\n*Top Transactions:*\n${monthTransactions.slice(0, 5).map(tx => `• ${tx.description}: ${formatCurrency(tx.amount, currency)}`).join('\n')}\n\n_Generated via Flow Finance_`;
    shareToWhatsApp(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Dashboard</span>
        </button>

        <div className="flex items-end justify-between mb-12">
          <div>
             <h2 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Reporting Engine</h2>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Statement</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={handlePrint}
               className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-600"
               title="Print Statement"
             >
               <Printer className="w-5 h-5" />
             </button>
             <button 
               onClick={handleWhatsAppStatement}
               className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-brand-success"
               title="WhatsApp Statement"
             >
               <MessageCircle className="w-5 h-5" />
             </button>
             <button 
               onClick={() => {
                 const text = `📄 Monthly Financial Statement - ${format(selectedMonth, 'MMMM yyyy')}\n\nSummary:\nIncome: ${formatCurrency(summary.income, currency)}\nExpenses: ${formatCurrency(summary.expense, currency)}\nNet Flow: ${formatCurrency(summary.income - summary.expense, currency)}`;
                 shareContent(`Statement ${format(selectedMonth, 'MMM yyyy')}`, text);
               }}
               className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-brand-primary"
               title="Share Statement (Notes, etc)"
             >
               <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
           {last6Months.map(month => (
             <button
               key={month.toISOString()}
               onClick={() => setSelectedMonth(month)}
               className={cn(
                 "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
                 format(selectedMonth, 'MMM yy') === format(month, 'MMM yy')
                  ? "bg-slate-900 text-white shadow-xl"
                  : "bg-white text-slate-400 border border-slate-100"
               )}
             >
               {format(month, 'MMMM yyyy')}
             </button>
           ))}
        </div>

        {/* Statement Document Preview */}
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-12 border border-slate-100 overflow-hidden relative print:shadow-none print:border-none print:p-0">
           {/* Document Header */}
           <div className="flex justify-between items-start mb-16 border-b border-slate-100 pb-12">
              <div>
                 <div className="text-2xl font-black text-slate-900 uppercase italic mb-1">Flow</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-2 decoration-brand-primary underline-offset-4">Statement of Account</div>
              </div>
              <div className="text-right">
                 <div className="text-sm font-bold text-slate-800">{userName || 'Private Client'}</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(selectedMonth, 'MMMM yyyy')} Period</div>
              </div>
           </div>

           {/* Summary Grid */}
           <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="space-y-1">
                 <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Income</div>
                 <div className="text-2xl font-mono font-bold text-emerald-600">{formatCurrency(summary.income, currency)}</div>
              </div>
              <div className="space-y-1 border-x border-slate-100 px-8">
                 <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Expenses</div>
                 <div className="text-2xl font-mono font-bold text-red-500">{formatCurrency(summary.expense, currency)}</div>
              </div>
              <div className="space-y-1 text-right">
                 <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Net Capital Flow</div>
                 <div className={cn(
                   "text-2xl font-mono font-bold",
                   summary.income - summary.expense >= 0 ? "text-slate-900" : "text-red-500"
                 )}>
                   {formatCurrency(summary.income - summary.expense, currency)}
                 </div>
              </div>
           </div>

           {/* Transaction List */}
           <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">
                 <span>Description / Category</span>
                 <div className="flex gap-12">
                    <span className="w-24 text-right">Date</span>
                    <span className="w-24 text-right">Amount</span>
                 </div>
              </div>
              
              <div className="space-y-1">
                {monthTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 print:border-slate-100">
                    <div>
                       <div className="text-sm font-bold text-slate-800">{tx.description}</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.category}</div>
                    </div>
                    <div className="flex gap-12 items-center">
                       <span className="text-[10px] font-mono text-slate-400 text-right w-24">
                         {format(new Date(tx.date), 'dd MMM')}
                       </span>
                       <span className={cn(
                         "text-sm font-mono font-bold text-right w-24",
                         tx.type === 'income' ? "text-emerald-600" : "text-slate-900"
                       )}>
                         {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                       </span>
                    </div>
                  </div>
                ))}
                
                {monthTransactions.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No transaction data available for this period</p>
                  </div>
                )}
              </div>
           </div>

           {/* Footer Security Note */}
           <div className="mt-24 pt-12 border-t border-slate-100 text-center print:mt-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Official Statement • Generated via Flow Finance Enclave</div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
              <p className="max-w-md mx-auto text-[8px] text-slate-300 font-bold leading-relaxed uppercase tracking-widest opacity-50">
                This document was generated locally by the Flow platform. It is intended for tracking and informational purposes. 
                All values are calculated in base currency {currency}.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
