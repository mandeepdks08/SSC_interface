const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");

const db = getFirestore();
const realDB = getDatabase();

module.exports = { db, realDB };
