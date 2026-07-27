const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const target = `  return (
    <div className="space-y-6 font-sans pb-20">`;

const replacement = `  return (
    <div className="space-y-6 font-sans pb-20">
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          confirmState.onConfirm();
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PosVendaPage.tsx', code);
