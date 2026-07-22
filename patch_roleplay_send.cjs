const fs = require('fs');
let code = fs.readFileSync('src/components/RolePlayIA.tsx', 'utf8');

code = code.replace(
  /const newMessages = \[\.\.\.messages, \{ role: 'user' as const, content: input \}\];\s*setMessages\(newMessages\);/ms,
  `
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: newMessages });
  `
);

code = code.replace(
  /setMessages\(\[\.\.\.newMessages, \{ role: 'model', content: data\.reply \}\]\);/ms,
  `
    const updatedWithModel = [...newMessages, { role: 'model' as const, content: data.reply }];
    setMessages(updatedWithModel);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: updatedWithModel });
  `
);

code = code.replace(
  /setMessages\(\[\.\.\.newMessages, \{ role: 'model', content: "Desculpe, ocorreu um erro de conexão\. Tente novamente\." \}\]\);/ms,
  `
    const errorMsg = [...newMessages, { role: 'model' as const, content: "Desculpe, ocorreu um erro de conexão. Tente novamente." }];
    setMessages(errorMsg);
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: errorMsg });
  `
);

code = code.replace(
  /setEvaluation\(parsed\);/ms,
  `setEvaluation(parsed);\n      setDoc(doc(db, 'roleplay_evaluations', vendorId), { evaluation: parsed });`
);

fs.writeFileSync('src/components/RolePlayIA.tsx', code);
