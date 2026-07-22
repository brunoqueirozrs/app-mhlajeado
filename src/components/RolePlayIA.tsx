import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/db';
import { collection, onSnapshot, doc, setDoc, query, where, orderBy, addDoc } from 'firebase/firestore';
import { Send, User, Bot, AlertCircle, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';

interface RolePlayIAProps {
  vendorId: string;
  vendorName: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function RolePlayIA({ vendorId, vendorName }: RolePlayIAProps) {
  const [persona, setPersona] = useState('indeciso');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isSavingSync, setIsSavingSync] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const showSyncSuccess = (msg: string) => {
    setSyncSuccessMsg(msg);
    setTimeout(() => setSyncSuccessMsg(null), 3000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStart = () => {
    
    
    const greetingMsg = { role: 'model', content: getInitialGreeting(persona) };
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: [greetingMsg] });
    setDoc(doc(db, 'roleplay_evaluations', vendorId), { evaluation: null });
  
  
    setEvaluation(null);
  };

  const getInitialGreeting = (p: string) => {
    switch (p) {
      case 'indeciso': return "Oi... pois não? Internet? Olha, eu tô com pressa agora, e eu já tenho a da concorrência, sabe... mas o que você tem aí?";
      case 'irritado': return "O que é?! Se for vender internet pode ir embora, já tive problema demais com vocês do lado de cá, tudo a mesma coisa, cai toda hora e quando chove piora. E ainda o suporte não atende!";
      case 'porta_fechada': return "Moço, desculpa mas eu tô no meio de uma janta aqui, não tenho tempo agora. Eu já tenho a Vivo, não quero trocar, obrigado. Boa noite.";
      default: return "Olá, pois não?";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: newMessages });
  
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/roleplay/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, persona })
      });
      const data = await res.json();
      
    const updatedWithModel = [...newMessages, { role: 'model' as const, content: data.reply }];
    setMessages(updatedWithModel);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: updatedWithModel });
  
    } catch (e) {
      
    const errorMsg = [...newMessages, { role: 'model' as const, content: "Desculpe, ocorreu um erro de conexão. Tente novamente." }];
    setMessages(errorMsg);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: errorMsg });
  
    } finally {
      setIsTyping(false);
    }
  };

  const finishAndEvaluate = async () => {
    if (messages.length < 3) {
      alert("A conversa está muito curta para ser avaliada.");
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/ai/roleplay/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, persona })
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (e) {
      alert("Erro ao avaliar roleplay.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            Role Play IA (LLM as a Judge)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Treinamento prático de contorno de objeções com {vendorName}</p>
        </div>
        
        {messages.length === 0 && !evaluation && (
          <div className="flex items-center gap-2">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700"
            >
              <option value="indeciso">Persona: Cliente Indeciso</option>
              <option value="irritado">Persona: Cliente Irritado/Traumatizado</option>
              <option value="porta_fechada">Persona: Cliente Porta Fechada (Apressado)</option>
            </select>
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm"
            >
              Iniciar Simulação
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        {!evaluation ? (
          <>
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Bot className="w-16 h-16 text-indigo-200 mb-4" />
                <h4 className="text-lg font-bold text-slate-700">Bem-vindo ao Simulador</h4>
                <p className="text-sm max-w-md mt-2">Escolha uma persona acima e inicie o roleplay. Tente vender a fibra óptica da MHNET, contornar as objeções e fechar o negócio. Depois, peça a avaliação da IA.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Chat Input */}
            {messages.length > 0 && (
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Digite sua fala de vendedor..."
                    disabled={isTyping || isEvaluating}
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isTyping || isEvaluating || !input.trim()}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Dica: Seja persuasivo e natural.</span>
                  <button
                    onClick={finishAndEvaluate}
                    disabled={isTyping || isEvaluating || messages.length < 3}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {isEvaluating ? "Avaliando..." : "Finalizar Simulação e Avaliar"} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Feedback Analítico da IA
                </h3>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-500 uppercase">Score Final</span>
                  <span className={`text-3xl font-black ${evaluation.score >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>{evaluation.score}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Abordagem</span>
                  <span className="text-xl font-black text-slate-800">{evaluation.criteriaScores?.abordagem || 0}/20</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Sondagem</span>
                  <span className="text-xl font-black text-slate-800">{evaluation.criteriaScores?.sondagem || 0}/20</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Objeções</span>
                  <span className="text-xl font-black text-slate-800">{evaluation.criteriaScores?.contornoObjeccoes || 0}/30</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Fechamento</span>
                  <span className="text-xl font-black text-slate-800">{evaluation.criteriaScores?.fechamento || 0}/30</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4" /> Raciocínio do Treinador (LLM)
                </h4>
                <p className="text-sm text-indigo-800 whitespace-pre-wrap leading-relaxed">{evaluation.feedbackAnalitico}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Recomendação de Ouro
                </h4>
                <p className="text-sm text-emerald-800 font-medium">{evaluation.recomendacao}</p>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => { setEvaluation(null); setMessages([]); setPersona('indeciso'); }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Novo Role Play
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
