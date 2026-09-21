'use client';

import { useState } from 'react';
import { 
  X, 
  Pin, 
  CheckSquare, 
  Plus, 
  BarChart2, 
  Sparkles, 
  Trash2, 
  Check, 
  Calendar,
  Layers
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface SharedBoardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export function SharedBoardDrawer({ isOpen, onClose, roomTitle }: SharedBoardDrawerProps) {
  const { t, lang } = useLanguage();
  
  // Notice state
  const [notice, setNotice] = useState(
    lang === 'bn' 
      ? 'স্বাগতম আড্ডা রুমে! জরুরি ফাইল ও লিংক এই বোর্ডে শেয়ার করে রাখুন।' 
      : 'Welcome to this Adda Room! Pin important updates and tasks here.'
  );
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [tempNotice, setTempNotice] = useState(notice);

  // Checklist items
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: lang === 'bn' ? 'সবার সাথে প্ল্যান আলোচনা করা' : 'Discuss roadmap with team', completed: true },
    { id: '2', text: lang === 'bn' ? 'প্রজেক্ট ডেমো প্রস্তুত রাখা' : 'Prepare project demo', completed: false },
    { id: '3', text: lang === 'bn' ? 'ফিডব্যাক সংগ্রহ করা' : 'Collect feedback', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Quick Poll
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState([4, 7]);

  if (!isOpen) return null;

  const toggleTask = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setChecklist(prev => [
      ...prev,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false }
    ]);
    setNewTaskText('');
  };

  const deleteTask = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleVote = (index: number) => {
    if (pollVoted !== null) return;
    setPollVoted(index);
    setPollVotes(prev => {
      const next = [...prev];
      next[index] += 1;
      return next;
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#111b21] border-l border-brand-border shadow-2xl flex flex-col text-white animate-fade-in select-none">
      {/* Header */}
      <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#182229]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{t.sharedBoardTitle}</h3>
            <p className="text-[11px] text-gray-400 line-clamp-1">{roomTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Section 1: Pinned Room Notice */}
        <div className="bg-[#182229] border border-amber-500/30 rounded-2xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Pin className="w-3.5 h-3.5 fill-current" />
              <span>{t.pinnedNotices}</span>
            </span>
            <button
              onClick={() => {
                if (isEditingNotice) {
                  setNotice(tempNotice);
                  setIsEditingNotice(false);
                } else {
                  setTempNotice(notice);
                  setIsEditingNotice(true);
                }
              }}
              className="text-[11px] text-brand-emerald hover:underline font-semibold"
            >
              {isEditingNotice ? t.save : t.edit}
            </button>
          </div>

          {isEditingNotice ? (
            <textarea
              value={tempNotice}
              onChange={(e) => setTempNotice(e.target.value)}
              className="w-full bg-[#202c33] border border-brand-border rounded-xl p-2 text-xs text-white focus:outline-none focus:border-brand-emerald resize-none"
              rows={3}
            />
          ) : (
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              {notice}
            </p>
          )}
        </div>

        {/* Section 2: Collaborative Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5 text-brand-emerald" />
              <span>{t.roomChecklist}</span>
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {checklist.filter(c => c.completed).length}/{checklist.length}
            </span>
          </div>

          {/* New Item input */}
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t.addChecklistItem}
              className="flex-1 bg-[#202c33] border border-brand-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-emerald"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="p-2 bg-brand-emerald text-brand-dark rounded-xl font-bold hover:brightness-110 disabled:opacity-40 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Checklist items list */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-[#182229] border border-brand-border/70 hover:border-brand-emerald/40 transition-all"
              >
                <div
                  onClick={() => toggleTask(item.id)}
                  className="flex items-center gap-2.5 flex-1 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      item.completed ? 'bg-brand-emerald border-brand-emerald text-brand-dark' : 'border-gray-500'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs transition-all ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Room Poll */}
        <div className="bg-[#182229] border border-brand-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{t.sharedPoll}</span>
          </div>

          <p className="text-xs font-semibold text-white">
            {lang === 'bn' ? 'পরবর্তী আড্ডা বা মিটিংয়ের সেরা সময় কখন?' : 'Best time for the next Adda sync?'}
          </p>

          <div className="space-y-2">
            {[
              { text: lang === 'bn' ? '☕ সন্ধ্যা ৭:০০ টা' : '☕ 7:00 PM Evening', count: pollVotes[0] },
              { text: lang === 'bn' ? '🌙 রাত ৯:০০ টা' : '🌙 9:00 PM Night', count: pollVotes[1] },
            ].map((option, idx) => {
              const total = pollVotes[0] + pollVotes[1];
              const pct = Math.round((option.count / total) * 100);
              const isSelected = pollVoted === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleVote(idx)}
                  className={`w-full relative overflow-hidden rounded-xl p-2.5 text-left text-xs border transition-all ${
                    isSelected
                      ? 'border-brand-emerald bg-brand-emerald/10'
                      : 'border-brand-border bg-[#202c33] hover:border-gray-500'
                  }`}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-brand-emerald/20 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-between font-medium">
                    <span>{option.text}</span>
                    <span className="text-[11px] text-gray-400 font-bold">{pct}% ({option.count})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
