import React from 'react';
import { Bot } from 'lucide-react';

export const AIParecerBlock = ({ message, title = "Parecer do Agente IA" }: { message: React.ReactNode, title?: string }) => (
  <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100 shadow-sm print:break-inside-avoid print:shadow-none print:bg-indigo-50/50">
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 print:shadow-none">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-1.5 uppercase tracking-wider">
          {title}
          <span className="bg-indigo-200 text-indigo-800 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Análise IA</span>
        </h4>
        <div className="text-sm text-indigo-950/80 leading-relaxed font-medium">
          {message}
        </div>
      </div>
    </div>
  </div>
);
