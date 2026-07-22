with open("src/components/GestaoPessoasPage.tsx", "r") as f:
    content = f.read()

import re

# Find setCompetencias(vendors.map...) block and replace it with just setCompetencias([]) or nothing, actually it's inside useEffect
# The block is:
#       setCompetencias(vendors.map((v, i) => ({
#         id: `comp_${i}`, vendorId: v.id, data: new Date().toISOString(),
#         competencias: [
#           { nome: "Comunicação", autoavaliacao: 5, gestor: 4, ia: 4, baseline: 4 },
#           { nome: "Resiliência", autoavaliacao: 4, gestor: 3, ia: 3, baseline: 4 },
#           { nome: "Fechamento", autoavaliacao: 3, gestor: 2, ia: 2, baseline: 4 },
#           { nome: "Organização", autoavaliacao: 4, gestor: 4, ia: 5, baseline: 4 },
#           { nome: "Prospecção", autoavaliacao: 5, gestor: 5, ia: 4, baseline: 4 },
#         ]
#       })));

pattern = r'setCompetencias\(vendors\.map\(\(v, i\) => \(\{\s*id: `comp_\$\{i\}`.*?\n\s*\}\)\)\);'
content = re.sub(pattern, 'setCompetencias([]);', content, flags=re.DOTALL)

with open("src/components/GestaoPessoasPage.tsx", "w") as f:
    f.write(content)
