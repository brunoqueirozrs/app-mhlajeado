const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// 1. Update useState
code = code.replace(
  'useState<"dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial">("dashboard");',
  'useState<"dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial" | "fit_cargo" | "indices" | "clima" | "pulse" | "aval_360" | "inteligencia_emocional" | "teste_conhecimento" | "big_five">("dashboard");'
);

// 2. Update the map array
code = code.replace(
  '{(["dashboard", "disc", "pdi", "competencias", "perfil_comercial", "raiox", "coach"] as const).map(tab => (',
  '{(["dashboard", "disc", "pdi", "competencias", "perfil_comercial", "fit_cargo", "indices", "clima", "pulse", "aval_360", "inteligencia_emocional", "teste_conhecimento", "big_five", "raiox", "coach"] as const).map(tab => ('
);

// 3. Update the labels
code = code.replace(
  '{tab === "dashboard" ? "Resumo" : \n                     tab === "disc" ? "Teste DISC" :\n                     tab === "pdi" ? "PDI" :\n                     tab === "competencias" ? "Competências" :\n                     tab === "perfil_comercial" ? "Perfil Comercial" :\n                     tab === "raiox" ? "Raio-X (IA)" : "Coach IA"}',
  `{tab === "dashboard" ? "Resumo" : 
                     tab === "disc" ? "DISC / Perfil Animal" :
                     tab === "pdi" ? "PDI" :
                     tab === "competencias" ? "Competências" :
                     tab === "perfil_comercial" ? "Perfil Comercial" :
                     tab === "fit_cargo" ? "Fit de Cargo" :
                     tab === "indices" ? "Índices (Risco/Potencial)" :
                     tab === "clima" ? "Clima Organizacional" :
                     tab === "pulse" ? "Pulse Survey" :
                     tab === "aval_360" ? "Avaliação 360°" :
                     tab === "inteligencia_emocional" ? "Inteligência Emocional" :
                     tab === "teste_conhecimento" ? "Teste Conhecimento" :
                     tab === "big_five" ? "Big Five" :
                     tab === "raiox" ? "Raio-X (IA)" : "Coach IA"}`
);

// 4. Update the render placeholders
const renderFunctionsRegex = /const renderRaiox = \(\) => \([\s\S]*?\n  \);/;
const match = code.match(renderFunctionsRegex);

if (match) {
  const newRenderFunctions = match[0] + `\n\n  const renderPlaceholder = (title: string, desc: string) => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
      </div>
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-slate-200 mb-4" />
        <h4 className="text-lg font-bold text-slate-700">Módulo em Desenvolvimento</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          {desc}
        </p>
      </div>
    </div>
  );

  const renderFitCargo = () => renderPlaceholder("Fit de Cargo", "Módulo de alocação automática calculando a distância entre o perfil natural do colaborador e o perfil ideal.");
  const renderIndices = () => renderPlaceholder("Índices Preditivos (Risco/Potencial)", "Predição de desligamento e alto potencial baseado no cruzamento de dados de engajamento, PDI e testes.");
  const renderClima = () => renderPlaceholder("Clima Organizacional", "Módulo semanal/mensal para medir o clima geral e engajamento da equipe.");
  const renderPulse = () => renderPlaceholder("Pulse Survey", "Pesquisas rápidas de engajamento focadas em micro-interações semanais.");
  const renderAval360 = () => renderPlaceholder("Avaliação 360°", "Avaliação anual de liderança cruzando autoavaliação, pares, liderados e gestores.");
  const renderInteligenciaEmocional = () => renderPlaceholder("Inteligência Emocional", "Teste anual de inteligência emocional para mapear o comportamento interpessoal.");
  const renderTesteConhecimento = () => renderPlaceholder("Teste de Conhecimento", "Teste pós-treinamento focado em capacitação técnica.");
  const renderBigFive = () => renderPlaceholder("Big Five (OCEAN)", "Avaliação anual de personalidade Big Five, aplicada a líderes para alinhar perfil de gestão.");
`;
  code = code.replace(renderFunctionsRegex, newRenderFunctions);
}

// 5. Update dashboard render
code = code.replace(
  '{renderRaiox()}\n                </div>\n              )}',
  '{renderFitCargo()}\n                  {renderIndices()}\n                  {renderClima()}\n                  {renderPulse()}\n                  {renderAval360()}\n                  {renderInteligenciaEmocional()}\n                  {renderTesteConhecimento()}\n                  {renderBigFive()}\n                  {renderRaiox()}\n                </div>\n              )}'
);

// 6. Update conditional renders for individual tabs at the bottom
code = code.replace(
  '{vendorTab === "raiox" && renderRaiox()}',
  `{vendorTab === "fit_cargo" && renderFitCargo()}
              {vendorTab === "indices" && renderIndices()}
              {vendorTab === "clima" && renderClima()}
              {vendorTab === "pulse" && renderPulse()}
              {vendorTab === "aval_360" && renderAval360()}
              {vendorTab === "inteligencia_emocional" && renderInteligenciaEmocional()}
              {vendorTab === "teste_conhecimento" && renderTesteConhecimento()}
              {vendorTab === "big_five" && renderBigFive()}
              {vendorTab === "raiox" && renderRaiox()}`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Refactored successfully");
