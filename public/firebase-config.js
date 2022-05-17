import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js'
import { getDatabase, ref, onValue, get, child } from 'https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js'

const firebaseConfig = {
    apiKey: "AIzaSyAWjqFGL8j_JRMLbrpuwE_mblIJc1GnFX0",
    authDomain: "auth-demo-4efba.firebaseapp.com",
    databaseURL: "https://auth-demo-4efba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "auth-demo-4efba",
    storageBucket: "auth-demo-4efba.appspot.com",
    messagingSenderId: "586847569783",
    appId: "1:586847569783:web:c68c943c0be0e84d3a8372"
  };

  const app = initializeApp(firebaseConfig);
  const realDB = getDatabase(app);