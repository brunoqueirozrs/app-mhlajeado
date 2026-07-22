const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regex = /\{vendorTab === "modulos" && \(/;
const replacement = `{/* Rodapé de Impressão Fixo (Aparece em todas as páginas) */}
              <div className="hidden print:flex fixed bottom-0 left-0 right-0 w-full justify-between items-center text-[10px] text-slate-500 bg-white pt-2 pb-2 border-t border-slate-200 z-50">
                <span>MHNET Telecom - Gestão de Pessoas</span>
                <span>Página impressa em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span>Documento Confidencial de Uso Interno</span>
              </div>

              {vendorTab === "modulos" && (`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
