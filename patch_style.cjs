const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

const target = `            <div
              key={item.id}
              className="card-modern rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden bg-white hover:border-sky-300 transition-colors cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >`;

const replacement = `            <div
              key={item.id}
              className={\`card-modern rounded-2xl p-5 border shadow-sm flex flex-col relative overflow-hidden transition-colors cursor-pointer group \${
                selectedIds.includes(item.id)
                  ? "bg-sky-50 border-sky-400 ring-2 ring-sky-200"
                  : "bg-white border-slate-200 hover:border-sky-300"
              }\`}
              onClick={() => setSelectedItem(item)}
            >`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
