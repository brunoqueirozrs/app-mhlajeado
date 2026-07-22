import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const app = initializeApp({ projectId: undefined });
const db = getFirestore(app);
console.log("SUCCESS");
