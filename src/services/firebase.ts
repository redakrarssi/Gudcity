import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc as firestoreDoc, collection as firestoreCollection, 
  getDoc as firestoreGetDoc, getDocs as firestoreGetDocs, setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, query as firestoreQuery,
  where as firestoreWhere, serverTimestamp as firestoreServerTimestamp, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import mock implementations
import * as mockFirebase from './mockFirebase';

// Declare BYPASS_AUTH for the window object
declare global {
  interface Window {
    BYPASS_AUTH?: boolean;
  }
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-domain.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-bucket.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Set the BYPASS_AUTH flag to true by default for development
window.BYPASS_AUTH = window.BYPASS_AUTH === undefined ? true : window.BYPASS_AUTH;
const useMockFirebase = window.BYPASS_AUTH === true;
console.log('Firebase setup: Using mock implementation =', useMockFirebase);

// Initialize Firebase
let app = null;
let auth = null;
let db: Firestore | null = null;
let storage = null;

// Set up real Firebase if not in test mode
if (!useMockFirebase) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.log('Using mock Firebase implementation for development');
}

// Export either real or mock Firebase functions
export {
  app,
  auth,
  db,
  storage
};

// Export Firestore functions that can be either real or mock
export const doc = useMockFirebase ? mockFirebase.doc : firestoreDoc;
export const collection = useMockFirebase ? mockFirebase.collection : firestoreCollection;
export const getDoc = useMockFirebase ? mockFirebase.getDoc : firestoreGetDoc;
export const getDocs = useMockFirebase ? mockFirebase.getDocs : firestoreGetDocs;
export const setDoc = useMockFirebase ? mockFirebase.setDoc : firestoreSetDoc;
export const updateDoc = useMockFirebase ? mockFirebase.updateDoc : firestoreUpdateDoc;
export const deleteDoc = useMockFirebase ? mockFirebase.deleteDoc : firestoreDeleteDoc;
export const query = useMockFirebase ? mockFirebase.query : firestoreQuery;
export const where = useMockFirebase ? mockFirebase.where : firestoreWhere;
export const serverTimestamp = useMockFirebase ? mockFirebase.serverTimestamp : firestoreServerTimestamp;