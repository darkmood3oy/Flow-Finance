import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Loader2, Camera, Mic } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SmartInputProps {
  onAddTransaction: (data: any) => Promise<void>;
  selectedAccountId: string;
}

export function SmartInput({ onAddTransaction, selectedAccountId }: SmartInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAccountId) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        
        if (!res.ok) throw new Error('Failed to scan');
        const data = await res.json();
        
        const transactionData: any = {
          ...data,
          accountId: selectedAccountId
        };

        // Remove undefined values
        Object.keys(transactionData).forEach(key => {
          if (transactionData[key] === undefined) {
            delete transactionData[key];
          }
        });

        await onAddTransaction(transactionData);
      };
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedAccountId) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!res.ok) throw new Error('Failed to parse');
      const data = await res.json();
      
      const transactionData: any = {
        ...data,
        accountId: selectedAccountId,
      };

      // Remove undefined values to prevent Firestore errors
      Object.keys(transactionData).forEach(key => {
        if (transactionData[key] === undefined) {
          delete transactionData[key];
        }
      });
      
      await onAddTransaction(transactionData);
      setInput('');
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "relative transition-all duration-300 ease-out p-1 rounded-3xl bg-white/60 border backdrop-blur-sm shadow-inner overflow-hidden",
          isFocused ? "border-brand-primary/50" : "border-white/80"
        )}
      >
        <div className="flex items-center gap-3 px-8 h-20">
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors duration-300",
            isFocused ? "bg-brand-primary" : "bg-emerald-400"
          )} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Try "Spent £15 on Yard Sale Pizza"'
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-slate-400 italic font-medium"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isScanning} />
              <Camera className={cn("w-5 h-5", isScanning ? "animate-pulse text-brand-primary" : "text-slate-400")} />
            </label>
            <button 
              type="button" 
              onClick={startListening}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isListening ? "bg-red-50 text-red-500 scale-110 shadow-lg shadow-red-500/10" : "hover:bg-slate-100 text-slate-400"
              )}
            >
              <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
            </button>

            {isLoading || isScanning ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-white/80 border border-white">
                 <span className="text-[10px] font-bold text-brand-primary/60">TAB TO PARSE</span>
              </div>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                input.trim() && !isLoading 
                  ? "bg-brand-primary text-white scale-100 hover:scale-105 active:scale-95" 
                  : "bg-slate-200 text-slate-400 scale-90"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-3 flex gap-2 justify-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          NLP Powered by Gemini
        </span>
      </div>
    </div>
  );
}
