import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
const app = initializeApp({ projectId: undefined });
const db = getFirestore(app);
const c = collection(db, "test_results");
console.log("SUCCESS");
