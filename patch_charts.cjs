const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');

const diagCode = `      {aiDiagnostic && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl rounded-full" />
          <h3 className="flex items-center gap-2 font-black text-indigo-900 text-lg mb-3">
            <Brain className="w-5 h-5 text-indigo-600" /> Diagnóstico Estratégico IA
          </h3>
          <div className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap font-medium relative z-10">
            {aiDiagnostic}
          </div>
        </motion.div>
      )}`;

code = code.replace(
  '      </div>\n    </div>\n  );\n}',
  '      </div>\n\n' + diagCode + '\n\n    </div>\n  );\n}'
);

fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
