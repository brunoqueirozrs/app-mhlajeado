const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(/vendorPerfilComercial\.pontosFortesCampo\.map/g, '(vendorPerfilComercial.pontosFortesCampo || []).map');
code = code.replace(/vendorPerfilComercial\.areasMelhoriaCampo\.map/g, '(vendorPerfilComercial.areasMelhoriaCampo || []).map');
code = code.replace(/vendorPdis\.map/g, '(vendorPdis || []).map');
code = code.replace(/vendorRaiox\.map/g, '(vendorRaiox || []).map');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
