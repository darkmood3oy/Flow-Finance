import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CreditCard, Banknote, Wallet, Landmark, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface AccountManagerProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onCreateAccount: (data: any) => Promise<void>;
}

export function AccountManager({ 
  accounts, 
  selectedAccountId, 
  onSelectAccount, 
  onCreateAccount 
}: AccountManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('bank');
  const [newBalance, setNewBalance] = useState('0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAccount({
      name: newName,
      type: newType,
      balance: Number(newBalance),
    });
    setIsAdding(false);
    setNewName('');
    setNewType('bank');
    setNewBalance('0');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark className="w-5 h-5" />;
      case 'credit': return <CreditCard className="w-5 h-5" />;
      case 'cash': return <Banknote className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Accounts</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          Add Account
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
        {accounts.map((acc) => (
          <motion.button
            key={acc.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectAccount(acc.id)}
            className={cn(
              "flex-shrink-0 w-40 p-4 rounded-3xl border transition-all text-left relative",
              selectedAccountId === acc.id 
                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                : "bg-white/40 backdrop-blur-sm border-white/40 text-slate-800"
            )}
          >
            {selectedAccountId === acc.id && (
              <div className="absolute top-3 right-3 bg-white/20 rounded-full p-0.5">
                <Check className="w-3 h-3" />
              </div>
            )}
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-3",
              selectedAccountId === acc.id ? "bg-white/20" : "bg-slate-100"
            )}>
              {getIcon(acc.type)}
            </div>
            <div className="font-bold text-sm truncate">{acc.name}</div>
            <div className={cn(
              "text-xs font-mono mt-1",
              selectedAccountId === acc.id ? "text-white/80" : "text-slate-400"
            )}>
              £{acc.balance.toLocaleString()}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 p-6 mt-4"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
                  <input 
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/80 border border-white p-3 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-bold"
                    placeholder="e.g. Monzo Bank"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white/80 border border-white p-3 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-bold appearance-none"
                  >
                    <option value="bank">Bank</option>
                    <option value="credit">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Balance</label>
                <input 
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-white/80 border border-white p-3 rounded-2xl outline-none focus:border-brand-primary transition-colors text-xl font-mono font-bold"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-3 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-2xl font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
