const admin = require('firebase-admin');

if (!admin.apps.length) {
  // For Vercel, use service account or default credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'worldcup-agent',
    });
  }
}

const db = admin.firestore();

module.exports = { admin, db };
