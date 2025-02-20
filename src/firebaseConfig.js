import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqKzGkadOq2G3hEVQGVrgclgstWf__aUo",
  authDomain: "pmustudio-59c63.firebaseapp.com",
  projectId: "pmustudio-59c63",
  storageBucket: "pmustudio-59c63.appspot.com",
  messagingSenderId: "923847248820",
  appId: "1:923847248820:web:15a5c9ea689a1a120fc0e1",
  measurementId: "G-VXSV16WLZK",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Exportamos `auth` y `db`
export { auth, db };
