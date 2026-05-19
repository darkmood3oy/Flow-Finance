import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, TrendingUp, Share2, MessageCircle, Copy, Check, ChevronDown, ListFilter } from 'lucide-react';
import { formatCurrency, cn, shareToWhatsApp, shareContent } from '@/src/lib/utils';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  isRecurring?: boolean;
}

interface TransactionFeedProps {
  transactions: Transaction[];
  currency?: string;
}

type GroupBy = 'date' | 'category';

export function TransactionFeed({ transactions, currency = 'GBP' }: TransactionFeedProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sorted.reduce((acc, tx) => {
      let key = '';
      if (groupBy === 'date') {
        const d = new Date(tx.date);
        if (isToday(d)) key = 'Today';
        else if (isYesterday(d)) key = 'Yesterday';
        else key = format(d, 'MMMM d, yyyy');
      } else {
        key = tx.category || 'Uncategorized';
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions, groupBy]);

  const handleShare = async (tx: Transaction) => {
    const text = `${tx.type === 'income' ? 'Received' : 'Spent'} ${formatCurrency(tx.amount, currency)} at ${tx.description} (${tx.category}) on ${format(new Date(tx.date), 'PPpp')}`;
    await shareContent(`${tx.description} Transaction`, text);
    setCopiedId(tx.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsAppShare = (tx: Transaction) => {
    const text = `💸 *Transaction Detail*\n\n*Amount:* ${formatCurrency(tx.amount, currency)}\n*Description:* ${tx.description}\n*Category:* ${tx.category}\n*Date:* ${format(new Date(tx.date), 'PPpp')}\n\n_Shared via Flow Finance_`;
    shareToWhatsApp(text);
  };

  if (transactions.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 font-medium">No transactions yet. Type something above to start.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-12 mb-24">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Log</h3>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">Activity</div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setGroupBy('date')}
             className={cn(
               "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
               groupBy === 'date' ? "bg-white text-brand-primary shadow-sm" : "text-slate-400"
             )}
           >
             Date
           </button>
           <button 
             onClick={() => setGroupBy('category')}
             className={cn(
               "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
               groupBy === 'category' ? "bg-white text-brand-primary shadow-sm" : "text-slate-400"
             )}
           >
             Tags
           </button>
        </div>
      </div>
      
      <div className="space-y-12">
        {Object.entries(groupedTransactions).map(([group, txs]) => (
          <div key={group} className="space-y-4">
            <div className="flex items-center gap-4 px-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap">{group}</span>
              <div className="h-px w-full bg-slate-100" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {txs.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="frosted-card group !p-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         tx.type === 'income' ? "bg-emerald-50" : "bg-red-50"
                       )}>
                         {tx.type === 'income' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {tx.description}
                          </h4>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {tx.category} • {format(new Date(tx.date), 'h:mm a')}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "text-lg font-mono font-bold",
                        tx.type === 'income' ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleWhatsAppShare(tx)}
                          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-green-500 transition-colors"
                          title="Share to WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleShare(tx)}
                          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-brand-primary transition-colors"
                          title="Copy / Share"
                        >
                          {copiedId === tx.id ? <Check className="w-4 h-4 text-brand-success" /> : <Share2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
