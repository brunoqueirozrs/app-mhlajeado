const fs = require('fs');
const glob = require('glob');

glob('src/**/*.tsx', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // If we have ` catch (` preceded by something that isn't `}`, add `}`
    content = content.replace(/([^\} \t\n])\s+catch\s*\(/g, '$1 } catch (');
    // Also, if it is preceded by spaces/newlines but not `}`, we can try to fix it, but it's safer to just look for missing `}` in general.
    // Actually the `fix_jsx.cjs` did: `content.replace(/\}\s*catch/g, 'catch')` 
    // This literally changed `} catch` to `catch` or `}   catch` to `catch`.
    // So we can replace `catch (` with `} catch (` anywhere that it's just preceded by whitespace and NO `}`.
    content = content.replace(/(?<!\})\s+catch\s*\(/g, '\n} catch (');
    
    // It also did: `content.replace(/\}\s*finally/g, 'finally')`
    content = content.replace(/(?<!\})\s+finally\s*\{/g, '\n} finally {');
    
    // It also did: `content.replace(/\}\s*;/g, ';')`
    content = content.replace(/(?<!\})\s+;/g, '\n}');
    
    fs.writeFileSync(file, content, 'utf8');
  });
});
