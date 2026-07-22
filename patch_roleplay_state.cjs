const fs = require('fs');
let code = fs.readFileSync('src/components/RolePlayIA.tsx', 'utf8');

const regexStates = /const \[messages.*?\] = useState<Message\[\]>\(\[\]\);\s*const \[isSimulating.*?\] = useState\(false\);\s*const \[isEvaluating.*?\] = useState\(false\);\s*const \[evaluation.*?\] = useState<any>\(null\);/ms;

const replacementStates = `const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(\`roleplay_messages_\${vendorId}\`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(() => {
    const saved = localStorage.getItem(\`roleplay_evaluation_\${vendorId}\`);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(\`roleplay_messages_\${vendorId}\`, JSON.stringify(messages));
  }, [messages, vendorId]);

  useEffect(() => {
    localStorage.setItem(\`roleplay_evaluation_\${vendorId}\`, JSON.stringify(evaluation));
  }, [evaluation, vendorId]);`;

code = code.replace(regexStates, replacementStates);
fs.writeFileSync('src/components/RolePlayIA.tsx', code);
