import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, ChevronRight, Hash, Plus, Settings2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (data: any) => Promise<void>;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory
}: CategoryPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootCategories = categories.filter(c => !c.parentId);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxonomy & Tags</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-brand-primary flex items-center gap-1"
        >
          <Settings2 className="w-3 h-3" />
          Manage
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {rootCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all border",
              selectedCategoryId === cat.id
                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                : "bg-white/40 border-white/40 text-slate-600 hover:bg-white/60"
            )}
          >
            {cat.name}
          </button>
        ))}
        <button 
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          onClick={() => {}} // TODO: Add Category Modal
        >
          <Plus className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-6 frosted-card overflow-hidden"
          >
             <div className="grid grid-cols-2 gap-8">
               <div>
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Structure</h4>
                 <div className="space-y-2">
                    {rootCategories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-white/40 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500" />
                           <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-colors" />
                      </div>
                    ))}
                 </div>
               </div>
               <div className="border-l border-white/20 pl-8">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Tags</h4>
                 <div className="flex flex-wrap gap-2">
                    {['#grocery', '#personal', '#work', '#urgent'].map(tag => (
                      <div key={tag} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tighter">
                        <Hash className="w-2 h-2" />
                        {tag.replace('#', '')}
                      </div>
                    ))}
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
