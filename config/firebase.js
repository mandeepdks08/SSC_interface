const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
} = require("firebase/database");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
const firebaseConfig = {
  apiKey: "AIzaSyDsJVrQpZA8OcCmWk3X19-A2l8ZMy5aVm0",
  authDomain: "smartcart-eb460.firebaseapp.com",
  databaseURL:
    "https://smartcart-eb460-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartcart-eb460",
  storageBucket: "smartcart-eb460.appspot.com",
  messagingSenderId: "831156107896",
  appId: "1:831156107896:web:6a669855c81227398c4b8d",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
const firebase = {
    set: set,
    get: get,
    onValue: onValue,
    signInWithEmailAndPassword: signInWithEmailAndPassword,
    createUserWithEmailAndPassword: createUserWithEmailAndPassword,
    signOut: signOut
}
module.exports = {
    db: db,
    auth: auth,
    ref: ref,
    firebase: firebase
}