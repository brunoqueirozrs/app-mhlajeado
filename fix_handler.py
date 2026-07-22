with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    content = f.read()

handler_code = """
  const handleCompetenciasComplete = (resultados: Record<string, number>) => {
    if (!selectedVendor) return;
    
    // Transform the results into the expected shape
    const newCompetencias = Object.entries(resultados).map(([nome, val]) => ({
      nome,
      autoavaliacao: val,
      gestor: 0,
      ia: 0,
      baseline: 4
    }));

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

content = content.replace("  const handleTestSubmit = () => {", handler_code + "\n  const handleTestSubmit = () => {")

# Remove extra } at the end
if content.endswith("}\n}") or content.endswith("}}"):
    content = content[:-1]

with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    f.write(content)
