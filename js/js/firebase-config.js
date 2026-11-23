

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKNuvuB7o1NmDGqXS9uxP8Rs8Q-i3nBqQ",
  authDomain: "operacionquesito-53166.firebaseapp.com",
  projectId: "operacionquesito-53166",
  storageBucket: "operacionquesito-53166.firebasestorage.app",
  messagingSenderId: "123645528582",
  appId: "1:123645528582:web:95d39395fc53ae7bb95187",
  measurementId: "G-PZM16QHQFY"
};


// 2. Inicializamos Firebase
firebase.initializeApp(firebaseConfig);

// 3. Obtenemos una referencia al servicio de la base de datos Firestore
const dbFirestore = firebase.firestore();

console.log('[Firebase] SDK conectado e inicializado correctamente.');