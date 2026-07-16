const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const toRemove = `
        cobrancaMes1: cobranca1Idx >= 0 ? row[cobranca1Idx] : null,
        cobrancaMes2: cobranca2Idx >= 0 ? row[cobranca2Idx] : null,
        cobrancaMes3: cobranca3Idx >= 0 ? row[cobranca3Idx] : null,
`;
code = code.replace(toRemove, '');

const target = `
        rx_onu: row[11] || "",
        rx_olt: row[12] || "",
        status: "Pendente",`;
const addition = `
        cobrancaMes1: cobranca1Idx >= 0 ? row[cobranca1Idx] : null,
        cobrancaMes2: cobranca2Idx >= 0 ? row[cobranca2Idx] : null,
        cobrancaMes3: cobranca3Idx >= 0 ? row[cobranca3Idx] : null,`;

code = code.replace(target, target + addition);

fs.writeFileSync('server.ts', code, 'utf8');
