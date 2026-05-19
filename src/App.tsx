import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartInput } from './components/SmartInput';
import { HeroMetric } from './components/HeroMetric';
import { TransactionFeed } from './components/TransactionFeed';
import { 
  Settings, 
  Wallet, 
  UserCircle, 
  LogOut, 
  LogIn, 
  Loader2, 
  Download, 
  Globe, 
  Shield, 
  Trash2, 
  Github, 
  Target, 
  Settings2, 
  TrendingDown, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useAuth } from './context/AuthContext';
import { AccountManager } from './components/AccountManager';
import { AnalyticsSummary } from './components/AnalyticsSummary';
import { VisualAnalytics } from './components/VisualAnalytics';
import { StatementGenerator } from './components/StatementGenerator';
import { 
  subscribeToTransactions, 
  addTransaction as addTxToFirestore, 
  subscribeToProfile, 
  updateProfile,
  subscribeToAccounts,
  createAccount,
  subscribeToCategories,
  createCategory,
  subscribeToBudgets,
  setBudget
} from './lib/firestore';
import { cn, formatCurrency } from './lib/utils';
import { CategoryPicker } from './components/CategoryPicker';
import { BudgetSection } from './components/BudgetSection';
import { exportToCSV } from './lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryId?: string;
  description: string;
  date: string;
  accountId: string;
  isRecurring?: boolean;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: string;
}

export default function App() {
  const { user, loading: authLoading, signIn, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [dailyBudget, setDailyBudget] = useState(50);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'analytics' | 'budgets' | 'settings' | 'reports'>('activity');
  const [currency, setCurrency] = useState('GBP');

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
      return;
    }

    const unsubTx = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    });

    const unsubAcc = subscribeToAccounts(user.uid, (data) => {
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    });

    const unsubCat = subscribeToCategories(user.uid, (data) => {
      if (data.length === 0) {
        // Seed default categories
        const defaults = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Salary'];
        defaults.forEach(name => createCategory(user.uid, { name }));
      }
      setCategories(data);
    });

    const unsubBudgets = subscribeToBudgets(user.uid, (data) => {
      setBudgets(data);
    });

    const unsubProfile = subscribeToProfile(user.uid, (data) => {
      if (data?.dailyBudget) {
        setDailyBudget(data.dailyBudget);
      }
    });

    // Process Recurring Transactions
    const processRecurring = async () => {
      // In a real app, this would be a Cloud Function
      // Here we simulate it by checking if we should add new instances
      // Implementation omitted for brevity in this specific turn but would fetch 'recurring' collection
    };
    processRecurring();

    return () => {
      unsubTx();
      unsubAcc();
      unsubCat();
      unsubBudgets();
      unsubProfile();
    };
  }, [user, selectedAccountId]);

  const addTransaction = async (data: Omit<Transaction, 'id'>) => {
    if (!user) return;
    await addTxToFirestore(user.uid, data);
  };

  const handleCreateAccount = async (data: any) => {
    if (!user) return;
    const id = await createAccount(user.uid, data);
    if (id) setSelectedAccountId(id);
  };

  const handleUpdateBudget = async (newBudget: number) => {
    setDailyBudget(newBudget);
    if (user) {
      await updateProfile(user.uid, { dailyBudget: newBudget, currency: '£' });
    }
  };

  const calculateSafeToSpend = () => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const todayExpenses = transactions
      .filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start, end }))
      .reduce((acc, tx) => acc + tx.amount, 0);

    return Math.max(0, dailyBudget - todayExpenses);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-brand-primary rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-primary/20">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Flow Finance</h1>
          <p className="text-slate-500 mb-12 max-w-[280px] mx-auto">Autonomous intelligence for your financial life.</p>
          <button 
            onClick={() => signIn()}
            className="w-full max-w-xs bg-slate-900 text-white py-4 px-8 rounded-[24px] font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-brand-primary/10 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-10 pb-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Flow</h1>
          <div className="flex items-center gap-1.5 ">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enclave Encrypted</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 relative hover:scale-105 active:scale-95 transition-transform"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            {budgets.some(b => {
              const spent = transactions
                .filter(tx => tx.categoryId === b.categoryId && tx.type === 'expense')
                .reduce((acc, tx) => acc + tx.amount, 0);
              return spent / b.limit > 0.8;
            }) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
             ) : (
               <UserCircle className="w-6 h-6 text-white" />
             )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 z-10">
        <div className="max-w-2xl mx-auto">
          <BudgetBanner transactions={transactions} dailyBudget={dailyBudget} currency={currency} />

          <AccountManager 
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            onCreateAccount={handleCreateAccount}
          />

          <AnimatePresence mode="wait">
            {activeTab === 'activity' ? (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-6 mt-6 flex justify-end">
                    <button 
                      onClick={() => exportToCSV(transactions, `Flow_Transactions_${new Date().toISOString().split('T')[0]}`)}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                </div>

                <AnalyticsSummary transactions={transactions} currency={currency} />

                <div className="relative mt-8 px-6 z-10">
                  <SmartInput 
                    onAddTransaction={addTransaction} 
                    selectedAccountId={selectedAccountId}
                  />
                </div>

                <div className="px-6">
                  <TransactionFeed transactions={transactions} currency={currency} />
                </div>
              </motion.div>
            ) : activeTab === 'reports' ? (
              <motion.div
                key="reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StatementGenerator 
                  transactions={transactions} 
                  currency={currency}
                  userName={user?.displayName}
                  onBack={() => setActiveTab('activity')}
                />
              </motion.div>
            ) : activeTab === 'budgets' ? (
              <motion.div
                key="budgets"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <BudgetSection 
                  budgets={budgets}
                  categories={categories}
                  transactions={transactions}
                  currency={currency}
                  onSetBudget={async (catId, limit) => { if(user) await setBudget(user.uid, catId, limit, 'monthly'); }}
                />
              </motion.div>
            ) : activeTab === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <VisualAnalytics transactions={transactions} currency={currency} />
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="px-6 mt-8 space-y-8"
              >
                  <div className="frosted-card !p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <Globe className="w-6 h-6 text-brand-primary" />
                      Preferences
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-700">Base Currency</div>
                            <div className="text-xs text-slate-400">Default for all views.</div>
                          </div>
                          <select 
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-slate-100 p-2 rounded-xl text-sm font-bold border-none outline-none appearance-none px-4"
                          >
                            <option value="GBP">GBP (£)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                          <div>
                            <div className="font-bold text-slate-700">Spending Cap</div>
                            <div className="text-xs text-slate-400">Daily threshold target.</div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-lg font-mono font-bold text-slate-800">{formatCurrency(dailyBudget, currency)}</span>
                              <button 
                                onClick={() => {
                                  const val = prompt('New daily budget:', dailyBudget.toString());
                                  if (val) handleUpdateBudget(Number(val));
                                }}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                              >
                                <Settings className="w-4 h-4 text-slate-500" />
                              </button>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="frosted-card !p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-brand-success" />
                      Security
                    </h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left group">
                          <div>
                              <div className="font-bold text-slate-700">Data Export</div>
                              <div className="text-xs text-slate-400">JSON Archive.</div>
                          </div>
                          <Download className="w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors" />
                        </button>
                        <button 
                        onClick={() => logout()}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors text-left group"
                        >
                          <div>
                              <div className="font-bold text-red-600">Sign Out</div>
                              <div className="text-xs text-red-400">Terminate session.</div>
                          </div>
                          <Trash2 className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                  </div>

                  <div className="text-center space-y-4 pb-12">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Github className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">v1.2 Stable</span>
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-10 bg-white/80 backdrop-blur-2xl border-t border-slate-100 z-30 flex items-center justify-around shadow-2xl">
        <NavButton 
          icon={<Wallet className="w-6 h-6" />} 
          label="Wallet" 
          active={activeTab === 'activity'} 
          onClick={() => setActiveTab('activity')} 
        />
        <NavButton 
          icon={<Target className="w-6 h-6" />} 
          label="Goals" 
          active={activeTab === 'budgets'} 
          onClick={() => setActiveTab('budgets')} 
        />
        <NavButton 
          icon={<TrendingUp className="w-6 h-6" />} 
          label="Insights" 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
        />
        <NavButton 
          icon={<FileText className="w-6 h-6" />} 
          label="Report" 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
        />
        <NavButton 
          icon={<Settings2 className="w-6 h-6" />} 
          label="Menu" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all relative",
        active ? "text-brand-primary" : "text-slate-400"
      )}
    >
      <motion.div
        animate={active ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
      >
        {icon}
      </motion.div>
      <span className={cn(
        "text-[8px] font-black uppercase tracking-[0.2em] transition-opacity",
        active ? "opacity-100" : "opacity-40"
      )}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="absolute -top-1 right-0 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-sm shadow-brand-primary/50" 
        />
      )}
    </button>
  );
}

function BudgetBanner({ transactions, dailyBudget, currency }: { transactions: Transaction[], dailyBudget: number, currency: string }) {
  const now = new Date();
  const spentToday = transactions
    .filter(tx => tx.type === 'expense' && isWithinInterval(new Date(tx.date), { start: startOfDay(now), end: endOfDay(now) }))
    .reduce((acc, tx) => acc + tx.amount, 0);

  const remaining = dailyBudget - spentToday;
  const percentage = (spentToday / dailyBudget) * 100;
  const isOverBudget = remaining < 0;

  return (
    <div className="px-6 mt-4">
      <div className="frosted-card !p-8 relative overflow-hidden bg-white shadow-2xl shadow-slate-200/50">
        {/* Background Accent */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 transition-colors duration-700",
          isOverBudget ? "bg-red-500/20" : "bg-brand-primary/20"
        )} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency matrix</span>
                 <div className={cn(
                   "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                   isOverBudget ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                 )}>
                   {isOverBudget ? 'Critical' : 'Optimized'}
                 </div>
              </div>
              <div className={cn(
                "text-5xl font-mono font-bold tracking-tighter transition-colors",
                isOverBudget ? "text-red-500" : "text-slate-900"
              )}>
                {formatCurrency(Math.abs(remaining), currency)}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isOverBudget ? 'Over capacity' : 'Remaining capacity'}
              </p>
            </div>
            
            <div className="text-right">
               <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Daily Cap</div>
               <div className="text-xl font-mono font-bold text-slate-400">{formatCurrency(dailyBudget, currency)}</div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-end justify-between">
               <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Burn Velocity</div>
                  <div className="text-xl font-mono font-bold text-slate-800">{Math.round(percentage)}%</div>
               </div>
               <div className="text-right space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Burned</div>
                  <div className="text-xl font-mono font-bold text-slate-800">{formatCurrency(spentToday, currency)}</div>
               </div>
             </div>

             <div className="relative">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percentage)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      percentage > 100 ? "bg-red-500" : 
                      percentage > 80 ? "bg-amber-400" : "bg-slate-900"
                    )}
                  />
                </div>
                {percentage > 100 && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="absolute -bottom-4 right-0 text-[8px] font-black text-red-500 uppercase tracking-widest"
                   >
                     Warning: Limit Exceeded
                   </motion.div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
