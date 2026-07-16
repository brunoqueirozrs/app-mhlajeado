/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, MessageSquare, Lightbulb } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendChatMessage: (message: string, history: Message[]) => Promise<string>;
}

export default function ChatModal({
  isOpen,
  onClose,
  onSendChatMessage
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Olá! Sou o assistente de vendas MHNET. Posso sugerir scripts de vendas, quebrar objeções de campo, falar sobre produtos ou debater estratégias porta a porta! Digite algo ou use os atalhos abaixo:"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const reply = await onSendChatMessage(text, history);
      setMessages(prev => [...prev, { role: "model", text: reply }]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Ocorreu uma instabilidade na minha rede de inteligência artificial de vendas. Vamos debater novamente em alguns instantes!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    "Crie um script curto de abordagem PAP",
    "MHNET vs Claro: qual o principal argumento?",
    "Como vender para quem reclama de WiFi fraco?",
    "Fale sobre o diferencial do técnico local"
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-end justify-center font-sans tracking-tight leading-normal" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-md h-[80vh] flex flex-col p-4 shadow-xl select-none" onClick={e => e.stopPropagation()}>
        <div className="modal-handle w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-b-slate-100 pb-3 flex-shrink-0  pl-1 pr-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-900 text-white flex items-center justify-center">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-800">Assistente IA MHNET</div>
              <div className="text-[10px] text-[#00A86B] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 border rounded-lg active:scale-95"
          >
            Fechar
          </button>
        </div>

        {/* Message Panel list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pl-1 pr-1">
          {messages.map((m, idx) => {
            const isModel = m.role === "model";
            return (
              <div key={idx} className={`flex items-start gap-2.5 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                  isModel ? "bg-slate-200 text-slate-700" : "bg-sky-900 text-white font-bold"
                }`}>
                  {isModel ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`text-xs p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  isModel 
                    ? "bg-slate-50 text-slate-850 rounded-tl-sm border border-slate-100" 
                    : "bg-sky-900 text-white rounded-tr-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-750 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-sm text-xs text-slate-400 italic flex items-center gap-1.5 pl-4 pr-3.5">
                <div className="w-4 h-4 border-2 border-slate-250 border-t-sky-600 rounded-full animate-spin" />
                Analisando canais de vendas MHNET...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts tray if no conversation */}
        {messages.length === 1 && (
          <div className="py-2 space-y-1.5 flex-shrink-0">
            <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 pl-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Ideias de perguntas rápidos:
            </div>
            <div className="flex flex-wrap gap-1.5 pl-0.5">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  id={`qchat-prompt-${i}`}
                  onClick={() => handleSend(qp)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-slate-650 px-2.5 py-1.5 rounded-xl cursor-pointer text-left leading-none"
                >
                  "{qp}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="relative pt-2 border-t border-t-slate-50 flex gap-2 flex-shrink-0">
          <input
            id="chat-modal-input-field"
            type="text"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:bg-white"
            placeholder="Pergunte sobre planos, scripts..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(input); }}
          />
          <button
            id="chat-modal-send-btn"
            onClick={() => handleSend(input)}
            className="w-10 h-10 bg-sky-900 text-white rounded-xl flex items-center justify-center cursor-pointer transition active:scale-95 flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
