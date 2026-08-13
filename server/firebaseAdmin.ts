import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let db: Firestore;
let auth;

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Check if already initialized
    if (getApps().length === 0) {
      initializeApp({
        projectId: config.projectId,
      });
    }
    
    // Initialize Firestore with specific database ID if provided
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      db = getFirestore(getApp(), config.firestoreDatabaseId);
    } else {
      db = getFirestore();
    }
    
    auth = getAuth();
    console.log('Firebase Admin initialized successfully');
  } else {
    console.warn('firebase-applet-config.json not found. Firebase Admin not initialized.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export { db, auth };
