const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');

// replace import
code = code.replace('import { jsPDF } from "jspdf";', 'import html2pdf from "html2pdf.js";\nimport { jsPDF } from "jspdf";');

// replace exportToPDF
const exportFnStart = code.indexOf('const exportToPDF = () => {');
const exportFnEnd = code.indexOf('const generateDiagnostic = async () => {');

const newExportFn = `const exportToPDF = () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    // Configurações para o PDF
    const opt = {
      margin:       10,
      filename:     'Apresentacao_Analise_Cobrancas.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    // Botões a serem ocultados na hora do print
    const actionButtons = document.getElementById('dashboard-actions');
    if (actionButtons) actionButtons.style.display = 'none';
    
    html2pdf().set(opt).from(element).save().then(() => {
      if (actionButtons) actionButtons.style.display = 'flex';
    });
  };

  `;

code = code.substring(0, exportFnStart) + newExportFn + code.substring(exportFnEnd);

// Add IDs
code = code.replace('<div className="space-y-6 pb-12 animate-fade-in font-sans">', '<div id="dashboard-content" className="space-y-6 pb-12 animate-fade-in font-sans bg-slate-50 p-6 rounded-3xl">');
code = code.replace('<div className="flex gap-3">', '<div id="dashboard-actions" className="flex gap-3">');

fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
