const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexStates = /const \[discResults.*?\] = useState<DiscResult\[\]>\(\[\]\);\s*const \[pdis.*?\] = useState<PDI\[\]>\(\[\]\);\s*const \[raioxes.*?\] = useState<RaioX\[\]>\(\[\]\);\s*const \[competencias.*?\] = useState<CompetenciaAvaliacao\[\]>\(\[\]\);\s*const \[perfilComerciais.*?\] = useState<PerfilComercial\[\]>\(\[\]\);/ms;

const replacementStates = `const [discResults, setDiscResults] = useState<DiscResult[]>(() => {
    const saved = localStorage.getItem('gestao_discResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [pdis, setPdis] = useState<PDI[]>(() => {
    const saved = localStorage.getItem('gestao_pdis');
    return saved ? JSON.parse(saved) : [];
  });
  const [raioxes, setRaioxes] = useState<RaioX[]>(() => {
    const saved = localStorage.getItem('gestao_raioxes');
    return saved ? JSON.parse(saved) : [];
  });
  const [competencias, setCompetencias] = useState<CompetenciaAvaliacao[]>(() => {
    const saved = localStorage.getItem('gestao_competencias');
    return saved ? JSON.parse(saved) : [];
  });
  const [perfilComerciais, setPerfilComerciais] = useState<PerfilComercial[]>(() => {
    const saved = localStorage.getItem('gestao_perfilComerciais');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gestao_discResults', JSON.stringify(discResults));
  }, [discResults]);

  useEffect(() => {
    localStorage.setItem('gestao_pdis', JSON.stringify(pdis));
  }, [pdis]);

  useEffect(() => {
    localStorage.setItem('gestao_raioxes', JSON.stringify(raioxes));
  }, [raioxes]);

  useEffect(() => {
    localStorage.setItem('gestao_competencias', JSON.stringify(competencias));
  }, [competencias]);

  useEffect(() => {
    localStorage.setItem('gestao_perfilComerciais', JSON.stringify(perfilComerciais));
  }, [perfilComerciais]);`;

code = code.replace(regexStates, replacementStates);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
