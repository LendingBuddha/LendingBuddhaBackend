

import admin from 'firebase-admin';
const serviceAccount = {
    type: process.env.FIREBASE_TYPE, 
    projectId: process.env.PROJECT_ID,
    privateKeyId: process.env.PRIVATE_KEY_FIREBASE_ID,
    privateKey: process.env.PRIVATE_KEY_FIREBASE.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
    clientId: process.env.CLIENT_ID,
    authUri: process.env.AUTH_URI,
    tokenUri: process.env.TOKEN_URI,
    authProviderX509CertUrl: process.env.AUTH_PROVIDER,
    clientX509CertUrl: process.env.CLIENT_URL,
    universeDomain: process.env.UNIVERSE_DOMAIN,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: Add your Firebase databaseURL
    databaseURL: process.env.PROJECT_ID
});

export default admin;
