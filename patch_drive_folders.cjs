const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `      const fileMetadata = {
        name: newFileName,
        parents: ['1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf']
      };
      const media = {
        mimeType: abs.mimeType || 'application/octet-stream',
        body: stream,
      };

      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });
        if (file.data.webViewLink) {`;

const newLogic = `      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const vendedorFolder = abs.vendedor || "Consultor";
        
        // 1. Verificar se a pasta do vendedor existe
        const folderQuery = \`mimeType='application/vnd.google-apps.folder' and name='\${vendedorFolder}' and '1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf' in parents and trashed=false\`;
        let folderId = null;
        
        const resFolders = await drive.files.list({
          q: folderQuery,
          fields: 'files(id, name)',
          spaces: 'drive',
        });
        
        if (resFolders.data.files && resFolders.data.files.length > 0) {
          folderId = resFolders.data.files[0].id;
        } else {
          // 2. Se não existir, criar a pasta
          const folderMetadata = {
            name: vendedorFolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf']
          };
          const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id',
          });
          folderId = folder.data.id;
        }

        const fileMetadata = {
          name: newFileName,
          parents: [folderId]
        };
        const media = {
          mimeType: abs.mimeType || 'application/octet-stream',
          body: stream,
        };

        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });
        if (file.data.webViewLink) {`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('server.ts', code);
console.log("Patched Drive folders logic.");
