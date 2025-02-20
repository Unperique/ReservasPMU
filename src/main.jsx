import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { auth, db } from "./firebaseConfig"; // Asegúrate de que el archivo exista

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
