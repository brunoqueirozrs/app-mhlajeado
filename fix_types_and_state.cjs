const fs = require('fs');

// 1. Update src/types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(
  '    ia: number;\n  }[];',
  '    ia: number;\n    baseline?: number;\n  }[];'
);
fs.writeFileSync('src/types.ts', typesCode);

// 2. Update src/components/GestaoPessoasPage.tsx
let pageCode = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Add missing states
const statesToInject = `
  const [isGeneratingDiscAnalysis, setIsGeneratingDiscAnalysis] = useState(false);
  const [discAnalysisResult, setDiscAnalysisResult] = useState<string | null>(null);
`;
pageCode = pageCode.replace(
  '  const [newPdi, setNewPdi] = useState<Partial<PDI>>({});',
  '  const [newPdi, setNewPdi] = useState<Partial<PDI>>({});' + statesToInject
);

// Fix missing dataAtualizacao in PDI
pageCode = pageCode.replace(
  'status: "em_andamento", dataCriacao: new Date().toISOString()',
  'status: "em_andamento", dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString()'
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', pageCode);

console.log("Fixed types and states");
