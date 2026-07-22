const fs = require('fs');
let code = fs.readFileSync('src/components/RolePlayIA.tsx', 'utf8');

// Use a single doc for messages per vendor: roleplay_messages/{vendorId} -> { messages: [...] }
const replacementStates = `const [messages, setMessages] = useState<Message[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    if (!vendorId) return;
    const unsubMessages = onSnapshot(doc(db, 'roleplay_messages', vendorId), (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      } else {
        setMessages([]);
      }
    });

    const unsubEval = onSnapshot(doc(db, 'roleplay_evaluations', vendorId), (docSnap) => {
      if (docSnap.exists()) {
        setEvaluation(docSnap.data().evaluation || null);
      } else {
        setEvaluation(null);
      }
    });

    return () => {
      unsubMessages();
      unsubEval();
    };
  }, [vendorId]);`;

code = code.replace(/const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\);.*?\}\), \[vendorId\]\);/ms, replacementStates);

// handleStart
code = code.replace(
  /const greetingMsg = .*?\/\/ YES! Storing array of messages in a single document per vendor is MUCH easier./ms,
  `
    const greetingMsg = { role: 'model', content: getInitialGreeting(persona) };
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: [greetingMsg] });
    setDoc(doc(db, 'roleplay_evaluations', vendorId), { evaluation: null });
  `
);

// handleSend
code = code.replace(
  /setMessages\(\(prev\) => \[\.\.\.prev, newUserMsg\]\);/ms,
  `
    const updatedMessages = [...messages, newUserMsg];
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: updatedMessages });
  `
);

code = code.replace(
  /setMessages\(\(prev\) => \[\.\.\.prev, aiMsg\]\);/ms,
  `
    // We update the messages array after AI responds
    const finalMessages = [...messages, newUserMsg, aiMsg];
    setDoc(doc(db, 'roleplay_messages', vendorId), { messages: finalMessages });
  `
);

// handleEvaluate
code = code.replace(
  /setEvaluation\(parsed\);/ms,
  `setDoc(doc(db, 'roleplay_evaluations', vendorId), { evaluation: parsed });`
);

fs.writeFileSync('src/components/RolePlayIA.tsx', code);
