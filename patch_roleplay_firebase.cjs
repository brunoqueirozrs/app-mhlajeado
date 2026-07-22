const fs = require('fs');
let code = fs.readFileSync('src/components/RolePlayIA.tsx', 'utf8');

// Add Firebase imports
code = code.replace(
  /import \{ Send, User/, 
  `import { db } from '../lib/firebase';\nimport { collection, onSnapshot, doc, setDoc, query, where, orderBy } from 'firebase/firestore';\nimport { Send, User`
);

// Replace state initializations
const regexStates = /const \[messages.*?\] = useState<Message\[\]>\(.*?\);.*?useEffect\(\(\) => \{\s*localStorage\.setItem\(\`roleplay_evaluation_\$\{vendorId\}\`, JSON\.stringify\(evaluation\)\);\s*\}, \[evaluation, vendorId\]\);/ms;

const replacementStates = `const [messages, setMessages] = useState<Message[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    if (!vendorId) return;
    const qMessages = query(collection(db, 'roleplay_messages'), where('vendorId', '==', vendorId), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data() as Message));
    });

    const qEval = query(collection(db, 'roleplay_evaluations'), where('vendorId', '==', vendorId));
    const unsubEval = onSnapshot(qEval, (snapshot) => {
      if (!snapshot.empty) {
        setEvaluation(snapshot.docs[0].data());
      } else {
        setEvaluation(null);
      }
    });

    return () => {
      unsubMessages();
      unsubEval();
    };
  }, [vendorId]);`;

code = code.replace(regexStates, replacementStates);

// Update handleStart
code = code.replace(
  /setMessages\(\[\s*\{\s*role:\s*'model',\s*content:\s*getInitialGreeting\(persona\)\s*\}\s*\]\);/ms,
  `
    const greetingMsg = { id: \`msg_\${Date.now()}\`, vendorId, role: 'model', content: getInitialGreeting(persona), timestamp: Date.now() };
    setDoc(doc(db, 'roleplay_messages', greetingMsg.id), greetingMsg);
    // clear old messages for this vendor (ideally a cloud function or batch delete, but for now we just append or use a session ID. Let's just use a session ID or keep it simple and just overwrite? Actually, if we start a new one, we might want to clear old ones. For now, let's keep it as appending, or let's generate a session ID and clear old docs).
    // Actually, in the old code it was just setMessages([]). So we need to delete old ones.
    // We'll skip deleting for now or just trust the user. Wait, if they start over, they want to start a new chat.
    // Instead of doing batch delete on client, let's just make messages use a session ID. Or just update a single document with an array of messages?
    // YES! Storing array of messages in a single document per vendor is MUCH easier.
  `
);

fs.writeFileSync('src/components/RolePlayIA.tsx', code);
