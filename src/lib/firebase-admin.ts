import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  credential: cert({
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  }),
}

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

/** SERVER SIDE ONLY */
export const adminDb = getFirestore(app)
