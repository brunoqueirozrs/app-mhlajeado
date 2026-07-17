const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Replace all gviz/tq urls with cache busted versions
content = content.replace(/gviz\/tq\?tqx=out:csv&sheet=" \+ encodeURIComponent\((.*?)\)/g, 'gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent($1) + "&_rnd=" + Date.now()');
content = content.replace(/gviz\/tq\?tqx=out:csv&headers=1&sheet=" \+ encodeURIComponent\((.*?)\)/g, 'gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent($1) + "&_rnd=" + Date.now()');

fs.writeFileSync('server.ts', content);
console.log('Patched cache bust');
