const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// For renderDisc:
code = code.replace(
  '                        </h3>\n                      </div>\n                      \n                      {isTakingTest ? (',
  `                        </h3>
                        {vendorDisc && !isTakingTest && (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md hidden md:inline-block">
                              Aplicado em: {new Date(vendorDisc.data).toLocaleDateString('pt-BR')} às {new Date(vendorDisc.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {isAdmin && (
                              <button onClick={() => handleDeleteTest('disc_results', vendorDisc.id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md border border-red-200 transition">
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isTakingTest ? (`
);

// For renderCompetencias:
code = code.replace(
  `                          <button \n                             onClick={() => setIsTakingCompetenciasTest(true)}\n                            className="px-3 py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"\n                          >\n                            <Play className="w-3 h-3" /> {vendorCompetencias ? "Refazer Autoavaliação" : "Iniciar Autoavaliação"}\n                          </button>\n                        )}`,
  `                          <div className="flex items-center gap-3">
                            {vendorCompetencias && (
                              <>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md hidden md:inline-block">
                                  Aplicado em: {new Date(vendorCompetencias.data || 0).toLocaleDateString('pt-BR')} às {new Date(vendorCompetencias.data || 0).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                {isAdmin && (
                                  <button onClick={() => handleDeleteTest('competencias', vendorCompetencias.id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md border border-red-200 transition">
                                    Excluir
                                  </button>
                                )}
                              </>
                            )}
                            <button 
                               onClick={() => setIsTakingCompetenciasTest(true)}
                              className="px-3 py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> {vendorCompetencias ? "Refazer Autoavaliação" : "Iniciar Autoavaliação"}
                            </button>
                          </div>
                        )}`
);

// For renderPerfilComercial:
code = code.replace(
  `                        <button \n                           onClick={() => setIsEditingPerfilComercial(true)}\n                          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"\n                        >\n                          <Edit2 className="w-3 h-3" /> {vendorPerfilComercial ? "Atualizar Perfil" : "Preencher Perfil"}\n                        </button>`,
  `                        <div className="flex items-center gap-3">
                          {vendorPerfilComercial && (
                            <>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md hidden md:inline-block">
                                Aplicado em: {new Date(vendorPerfilComercial.data || 0).toLocaleDateString('pt-BR')} às {new Date(vendorPerfilComercial.data || 0).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {isAdmin && (
                                <button onClick={() => handleDeleteTest('perfil_comerciais', vendorPerfilComercial.id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md border border-red-200 transition">
                                  Excluir
                                </button>
                              )}
                            </>
                          )}
                          <button 
                             onClick={() => setIsEditingPerfilComercial(true)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> {vendorPerfilComercial ? "Atualizar Perfil" : "Preencher Perfil"}
                          </button>
                        </div>`
);

// For renderRaiox:
code = code.replace(
  `          <button onClick={generateRaioX} disabled={isGeneratingRaiox} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden">\n            {isGeneratingRaiox ? "Gerando Resumo..." : "Recalcular com IA"}\n          </button>`,
  `          <div className="flex items-center gap-3 print:hidden">
            {vendorRaiox[0] && (
              <>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md hidden md:inline-block">
                  Último: {new Date(vendorRaiox[0].data || 0).toLocaleDateString('pt-BR')} às {new Date(vendorRaiox[0].data || 0).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </span>
                {isAdmin && (
                  <button onClick={() => handleDeleteTest('raioxes', vendorRaiox[0].id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md border border-red-200 transition">
                    Excluir
                  </button>
                )}
              </>
            )}
            <button onClick={generateRaioX} disabled={isGeneratingRaiox} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors">
              {isGeneratingRaiox ? "Gerando Resumo..." : "Recalcular com IA"}
            </button>
          </div>`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Patched tests headers");
