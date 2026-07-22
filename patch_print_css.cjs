const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const regexPrint = /@media print \{[\s\S]*?\.print\\:hidden \{[\s\S]*?\}\s*\}/m;
const replacePrint = `@media print {
  @page {
    margin: 1.5cm;
  }

  body, html, #root, main, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .flex-1 {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    background: white !important;
    color: black !important;
  }
  
  body * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print\\:hidden {
    display: none !important;
  }
  
  .print\\:block {
    display: block !important;
  }
  
  .print\\:flex {
    display: flex !important;
  }
  
  /* Formatação Específica da Tabela para Impressão */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 20px !important;
    box-shadow: none !important;
  }
  
  th, td {
    border: 1px solid #94a3b8 !important; /* slate-400 */
    padding: 8px !important;
    color: #0f172a !important; /* slate-900 */
  }
  
  th {
    background-color: #e2e8f0 !important; /* slate-200 */
    font-weight: bold !important;
  }
  
  tr:nth-child(even) td {
    background-color: #f8fafc !important; /* slate-50 */
  }
  
  /* Remove actions from tables */
  td button, td a.button {
    display: none !important;
  }
  
  /* Prevent page breaks */
  tr, .print\\:break-inside-avoid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/index.css', code);
