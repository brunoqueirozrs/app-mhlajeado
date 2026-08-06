import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const TARGET_DATABASE_ID = "ai-studio-appmhlajeado-e8def749-62be-43fa-b693-55f079017e21";

// Instância única do Firestore apontando exclusivamente para o banco especificado
export const db = getFirestore(app, TARGET_DATABASE_ID);

