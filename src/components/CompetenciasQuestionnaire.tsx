import React, { useState } from 'react';
import { COMPETENCIAS_DATA, Competencia } from '../data/competencias';

interface Props {
  vendorId: string;
  vendorName: string;
  onComplete: (resultados: Record<string, number>) => void;
  onCancel: () => void;
}

export default function CompetenciasQuestionnaire({ vendorId, vendorName, onComplete, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  
  // Vamos filtrar para as competencias que o colaborador precisa responder.
  // Por enquanto vamos exibir todas (ou podemos filtrar por Loja/Externa se tivessemos essa flag).
  // Vamos exibir todas Administrativas e as de Loja/Externa
  const competencias = COMPETENCIAS_DATA;
  const questions = competencias.flatMap(c => c.perguntas.map(p => ({ ...p, compId: c.id, compName: c.nome })));
  
  const handleAnswer = (qId: string, val: number) => {
    setRespostas(prev => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Calcular a média por competência
      const resultados: Record<string, number> = {};
      competencias.forEach(comp => {
        let sum = 0;
        let count = 0;
        comp.perguntas.forEach(q => {
          if (respostas[q.id]) {
            sum += respostas[q.id];
            count++;
          }
        });
        if (count > 0) {
          resultados[comp.nome] = sum / count;
        }
      });
      onComplete(resultados);
    }
  };

  const currentQ = questions[currentStep];
  const answered = !!respostas[currentQ.id];

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Autoavaliação de Competências</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Colaborador: {vendorName}</p>
        </div>
        <div className="text-sm font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
          Pergunta {currentStep + 1} de {questions.length}
        </div>
      </div>
      
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStep) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-8 min-h-[160px]">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg mb-4">
          Competência: {currentQ.compName}
        </span>
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
          {currentQ.enunciado}
        </h3>
        <p className="text-sm text-slate-500 mt-4 italic">
          Em uma escala de 1 a 5, avalie a frequência deste comportamento:
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-10">
        {[1, 2, 3, 4, 5].map(val => (
          <button
            key={val}
            onClick={() => handleAnswer(currentQ.id, val)}
            className={`py-4 rounded-xl font-black text-lg border-2 transition-all ${
              respostas[currentQ.id] === val
                ? 'bg-sky-500 border-sky-500 text-white shadow-md transform -translate-y-1'
                : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            <div className="flex flex-col items-center">
              <span>{val}</span>
              <span className="text-[10px] font-medium opacity-70 mt-1">
                {val === 1 ? 'Nunca' : val === 2 ? 'Raramente' : val === 3 ? 'Às vezes' : val === 4 ? 'Frequente' : 'Sempre'}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleNext}
          disabled={!answered}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          {currentStep === questions.length - 1 ? 'Finalizar Avaliação' : 'Próxima Pergunta'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
}
