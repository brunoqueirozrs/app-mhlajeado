const fs = require('fs');
const code = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('{/* Settlement Agreement (Promise) checkbox togglers */}'));
if (idx > -1) {
  lines.splice(idx, 0,
    '              <div className="flex items-center gap-2 pt-2">',
    '                <input',
    '                  type="checkbox"',
    '                  id="contatoEfetivoCheck"',
    '                  checked={contatoEfetivo}',
    '                  onChange={e => setContatoEfetivo(e.target.checked)}',
    '                  className="rounded border-slate-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"',
    '                />',
    '                <label htmlFor="contatoEfetivoCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">',
    '                  Contato Efetivo? (Atendeu e conversou)',
    '                </label>',
    '              </div>',
    '              <div className="space-y-1">',
    '                <label className="text-[10px] font-black uppercase text-slate-400 block pl-0.5">Motivo da Inadimplência (Diagnóstico)</label>',
    '                <select',
    '                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 focus:outline-none transition"',
    '                  value={motivoInadimplencia}',
    '                  onChange={e => setMotivoInadimplencia(e.target.value)}',
    '                >',
    '                  <option value="">Selecione o Motivo (Opcional)</option>',
    '                  <option value="Esquecimento">Esquecimento</option>',
    '                  <option value="Desemprego/Dificuldade Financeira">Desemprego / Dificuldade Financeira</option>',
    '                  <option value="Insatisfação com o Serviço">Insatisfação com o Serviço</option>',
    '                  <option value="Não Recebeu Fatura">Não Recebeu a Fatura</option>',
    '                  <option value="Cancelamento não processado">Cancelamento não processado</option>',
    '                  <option value="Problema de Saúde">Problema de Saúde</option>',
    '                  <option value="Outros">Outros</option>',
    '                </select>',
    '              </div>'
  );
  fs.writeFileSync('src/components/CobrancasPage.tsx', lines.join('\n'), 'utf8');
}
