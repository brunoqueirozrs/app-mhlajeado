const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newLogic = `    // Upload to Google Drive using the user's client-side OAuth token
    // This avoids the "Service Account Quota" limitation of Google Drive API
    if (fileData && fileName) {
      let token = await getAccessToken();
      if (!token) {
        try {
          const result = await googleSignIn();
          token = result?.accessToken || null;
        } catch (e) {
          console.warn("Pop-up do Google bloqueado ou fechado", e);
        }
      }

      if (token) {
        const folderName = loggedUser || "Consultor";
        const query = \`mimeType='application/vnd.google-apps.folder' and name='\${folderName}' and '1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf' in parents and trashed=false\`;
        
        let folderId = null;
        try {
          const searchRes = await fetch(\`https://www.googleapis.com/drive/v3/files?q=\${encodeURIComponent(query)}&fields=files(id,name)\`, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const searchData = await searchRes.json();
          if (searchData.files && searchData.files.length > 0) {
            folderId = searchData.files[0].id;
          } else {
            // Create folder
            const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: ['1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf']
              })
            });
            const createData = await createRes.json();
            if (createData.id) {
              folderId = createData.id;
            } else {
              console.error("Failed to create folder:", createData);
            }
          }
        } catch (err) {
          console.error("Erro ao buscar/criar pasta:", err);
        }

        if (folderId) {
          const boundary = 'foo_bar_baz_' + Date.now();
          const delimiter = "\\r\\n--" + boundary + "\\r\\n";
          const close_delim = "\\r\\n--" + boundary + "--";
          
          const base64Data = fileData.split(',')[1] || fileData;
          
          // Formata data e nome
          const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : '';
          const [ano, mes, dia] = (dataFalta || "").split("-");
          const dataFaltaFormatada = (dia && mes && ano) ? \`\${dia}-\${mes}-\${ano}\` : dataFalta;
          const finalFileName = \`\${folderName} - \${dataFaltaFormatada}\${ext}\`;
          
          const metadata = {
            name: finalFileName,
            parents: [folderId]
          };

          const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + (mimeType || 'application/octet-stream') + '\\r\\n' +
            'Content-Transfer-Encoding: base64\\r\\n\\r\\n' +
            base64Data +
            close_delim;

          try {
            const respUpload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/related; boundary=' + boundary,
              },
              body: multipartRequestBody
            });

            if (respUpload.ok) {
               const driveData = await respUpload.json();
               driveLink = driveData.webViewLink || "https://drive.google.com/file/d/" + driveData.id;
            } else {
               console.warn("Google Drive upload failed:", await respUpload.text());
            }
          } catch(err) {
             console.error("Erro no upload do arquivo:", err);
          }
        }
      }
      
      // Limpa a string base64 imensa para não sobrecarregar o servidor atoa
      // se já subiu pro Drive
      if (driveLink) {
        fileData = undefined; 
      }
    }

    const payload = {`;

code = code.replace(
    "    // We bypass client-side Google Drive upload and let backend/N8N handle the file data directly\n    const payload = {",
    newLogic
);

fs.writeFileSync('src/App.tsx', code);
