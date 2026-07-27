const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

const target = `          <div className="flex shrink-0 gap-3">
            <button 
              onClick={() => setIsAddingProtocol(true)}`;

const replacement = `          <div className="flex flex-wrap shrink-0 gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDisparoMassa}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Disparo em Massa ({selectedIds.length})</span>
              </button>
            )}
            <button 
              onClick={() => setIsAddingProtocol(true)}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
