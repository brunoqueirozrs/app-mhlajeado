import('jspdf').then(m => {
  const { jsPDF } = m;
  import('jspdf-autotable').then(m2 => {
    const autoTable = m2.default;
    const doc = new jsPDF();
    autoTable(doc, { head: [['A']], body: [['B']] });
    console.log("PDF generated successfully!");
  }).catch(e => console.error(e));
});
