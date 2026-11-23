// js/firebase-config.js - Inicialización de Firebase y Cloud Firestore (Operación Quesito)

const firebaseConfig = {
  apiKey: "AIzaSyAj3PMd0DnYd_AJleCs24EcJiw5yKHS0MY",
  authDomain: "operacion-quesito.firebaseapp.com",
  projectId: "operacion-quesito",
  storageBucket: "operacion-quesito.firebasestorage.app",
  messagingSenderId: "212911170297",
  appId: "1:212911170297:web:c5aee7f82bbf002ccaf828"
};

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a Cloud Firestore
const dbFirestore = firebase.firestore();

console.log('[Firebase] SDK conectado e inicializado correctamente.');