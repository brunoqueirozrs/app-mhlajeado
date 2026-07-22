import re

with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    content = f.read()

# Add import
import_statement = "import CompetenciasQuestionnaire from './CompetenciasQuestionnaire';\n"
content = content.replace("import { DISC_QUESTIONS } from '../data/discQuestions';", "import { DISC_QUESTIONS } from '../data/discQuestions';\n" + import_statement)

# Add state
state_code = "  const [isTakingCompetenciasTest, setIsTakingCompetenciasTest] = useState(false);"
content = content.replace("const [isTakingTest, setIsTakingTest] = useState(false);", "const [isTakingTest, setIsTakingTest] = useState(false);\n" + state_code)

# Add completion handler
handler_code = """
  const handleCompetenciasComplete = (resultados: Record<string, number>) => {
    if (!selectedVendor) return;
    
    // Transform the results into the expected shape
    const newCompetencias = Object.entries(resultados).map(([nome, val]) => ({
      nome,
      autoavaliacao: val,
      gestor: 0, // In a real app, this would be preserved if it exists
      ia: 0,
      baseline: 4 // default baseline
    }));

    // Check if we already have an entry for this vendor
    const existingIndex = competencias.findIndex(c => c.vendorId === selectedVendor.id);
    if (existingIndex >= 0) {
      const updated = [...competencias];
      updated[existingIndex] = {
        ...updated[existingIndex],
        competencias: newCompetencias
      };
      setCompetencias(updated);
    } else {
      setCompetencias([...competencias, {
        id: `comp_${Date.now()}`,
        vendorId: selectedVendor.id,
        data: new Date().toISOString(),
        competencias: newCompetencias
      }]);
    }
    
    setIsTakingCompetenciasTest(false);
  };
"""
content = content.replace("const handleDiscComplete = () => {", handler_code + "\n  const handleDiscComplete = () => {")

# Update renderCompetencias
old_render = """  const renderCompetencias = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          Radar de Competências
                        </h3>
                      </div>
                      
                      {vendorCompetencias ? ("""

new_render = """  const renderCompetencias = () => {
    if (isTakingCompetenciasTest && selectedVendor) {
      return (
        <CompetenciasQuestionnaire
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.nome}
          onComplete={handleCompetenciasComplete}
          onCancel={() => setIsTakingCompetenciasTest(false)}
        />
      );
    }

    return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          Radar de Competências
                        </h3>
                        {selectedVendor?.id === effectiveVendorId && (
                          <button 
                            onClick={() => setIsTakingCompetenciasTest(true)}
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> {vendorCompetencias ? "Refazer Autoavaliação" : "Iniciar Autoavaliação"}
                          </button>
                        )}
                      </div>
                      
                      {vendorCompetencias ? ("""

content = content.replace(old_render, new_render)

# Note: since renderCompetencias was an implicit return arrow function, we changed it to a block returning JSX.
# So we need to match the end `  );` and change it to `  ); }`
# Wait, let's just do a regex replace for the end of renderCompetencias
content = re.sub(r'(\s+</div>\n\s+</div>\n\s+\);)', r'\1\n  };\n', content, count=1)


with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    f.write(content)
