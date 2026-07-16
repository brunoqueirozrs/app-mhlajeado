const fs = require('fs');

let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

// 1. Add fields to default checklist
code = code.replace(
  '  foiIndicacaoNome: ""',
  '  foiIndicacaoNome: "",\n  cobrancaMes1: null,\n  cobrancaMes2: null,\n  cobrancaMes3: null'
);

// 2. Add section 5
const newSection = `
            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">5</span>
                Acompanhamento Financeiro (3 Primeiros Meses)
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 gap-3">
                  <span className="text-sm font-medium text-slate-700">Ação Cobrança 1º Mês</span>
                  <div className="flex flex-wrap gap-2">
                    <OptionBtn val="Pago" current={checklist.cobrancaMes1} onClick={() => setChecklist({...checklist, cobrancaMes1: "Pago"})} />
                    <OptionBtn val="Em Atraso" current={checklist.cobrancaMes1} onClick={() => setChecklist({...checklist, cobrancaMes1: "Em Atraso"})} />
                    <OptionBtn val="Enviado" current={checklist.cobrancaMes1} onClick={() => setChecklist({...checklist, cobrancaMes1: "Enviado"})} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 gap-3">
                  <span className="text-sm font-medium text-slate-700">Ação Cobrança 2º Mês</span>
                  <div className="flex flex-wrap gap-2">
                    <OptionBtn val="Pago" current={checklist.cobrancaMes2} onClick={() => setChecklist({...checklist, cobrancaMes2: "Pago"})} />
                    <OptionBtn val="Em Atraso" current={checklist.cobrancaMes2} onClick={() => setChecklist({...checklist, cobrancaMes2: "Em Atraso"})} />
                    <OptionBtn val="Enviado" current={checklist.cobrancaMes2} onClick={() => setChecklist({...checklist, cobrancaMes2: "Enviado"})} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 gap-3">
                  <span className="text-sm font-medium text-slate-700">Ação Cobrança 3º Mês</span>
                  <div className="flex flex-wrap gap-2">
                    <OptionBtn val="Pago" current={checklist.cobrancaMes3} onClick={() => setChecklist({...checklist, cobrancaMes3: "Pago"})} />
                    <OptionBtn val="Em Atraso" current={checklist.cobrancaMes3} onClick={() => setChecklist({...checklist, cobrancaMes3: "Em Atraso"})} />
                    <OptionBtn val="Enviado" current={checklist.cobrancaMes3} onClick={() => setChecklist({...checklist, cobrancaMes3: "Enviado"})} />
                  </div>
                </div>
              </div>
            </section>
`;

code = code.replace(
  '            {/* ACTION BUTTONS */}',
  newSection + '\n            {/* ACTION BUTTONS */}'
);

fs.writeFileSync('src/components/PosVendaPage.tsx', code, 'utf8');
