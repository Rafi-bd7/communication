'use client';

import { useState } from 'react';
import { X, Sparkles, Send, FileText, Languages, Bot } from 'lucide-react';
import { api } from '@/lib/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: string;
}

export function AIAssistantDrawer({ isOpen, onClose, activeConversationId }: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! I am Antigravity AI, your communication assistant. I can summarize conversations, translate messages, or answer your questions anytime!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const prompt = customPrompt || input;
    if (!prompt.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await api.askAssistant(prompt);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.result }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeConversationId) {
      alert('Please select an active conversation to summarize first!');
      return;
    }
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: 'Summarize the current conversation' }]);
    try {
      const res = await api.summarizeChat(activeConversationId);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.result }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Failed to summarize conversation.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-brand-surface border-l border-brand-border z-40 shadow-2xl flex flex-col animate-fade-in text-white select-none">
      {/* Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-card/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Antigravity AI Assistant</h3>
            <p className="text-[11px] text-gray-400">Real-time NLP & Chat Helper</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-brand-surface"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-b border-brand-border flex items-center gap-2 overflow-x-auto no-scrollbar bg-brand-dark/40">
        <button
          type="button"
          onClick={handleSummarize}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors flex-shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          Summarize Chat
        </button>

        <button
          type="button"
          onClick={() => handleSend('Help me draft a friendly and polite reply')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-emerald/15 hover:bg-brand-emerald/25 text-brand-emerald border border-brand-emerald/30 text-xs font-medium transition-colors flex-shrink-0"
        >
          <Bot className="w-3.5 h-3.5" />
          Draft Reply
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-brand-card text-gray-200 border border-brand-border rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 p-2 bg-purple-500/10 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AI is analyzing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-brand-border bg-brand-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            className="flex-1 bg-brand-card text-white text-xs rounded-xl px-3 py-2.5 border border-brand-border focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
