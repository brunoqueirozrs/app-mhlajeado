const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// 1. Fix setDiscResults in handleTestSubmit
code = code.replace(
  'setDiscResults([...discResults, newRes]);',
  'setDiscResults([...discResults.filter(d => d.vendorId !== selectedVendor.id), newRes]);'
);

// 2. Fix the "Próximo" and "Finalizar Teste" buttons to be disabled if not answered
const oldButtons = `<div className="flex justify-end gap-3">
                            <button onClick={() => setIsTakingTest(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                            {currentBlock < DISC_QUESTIONS.length - 1 ? (
                              <button onClick={() => setCurrentBlock(c => c+1)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl">Próximo</button>
                            ) : (
                              <button onClick={handleTestSubmit} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl">Finalizar Teste</button>
                            )}
                          </div>`;

const newButtons = `<div className="flex justify-end gap-3">
                            <button onClick={() => setIsTakingTest(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                            {currentBlock < DISC_QUESTIONS.length - 1 ? (
                              <button 
                                onClick={() => setCurrentBlock(c => c+1)} 
                                disabled={!testAnswers[currentBlock]?.mais || !testAnswers[currentBlock]?.menos}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Próximo
                              </button>
                            ) : (
                              <button 
                                onClick={handleTestSubmit} 
                                disabled={!testAnswers[currentBlock]?.mais || !testAnswers[currentBlock]?.menos}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Finalizar Teste
                              </button>
                            )}
                          </div>`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Fixed DISC bugs");
