import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 TU CONFIG ORIGINAL (NO QUITAR NADA) */
const firebaseConfig = {
  apiKey: "AIzaSyD92apK91B1M3Jin0p9Jw_68G8uxlsu_Cw",
  authDomain: "catalogo-bonsais.firebaseapp.com",
  projectId: "catalogo-bonsais",
  storageBucket: "catalogo-bonsais.firebasestorage.app",
  messagingSenderId: "733197067098",
  appId: "1:733197067098:web:03babf7f4542468cf68963"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contenedor = document.getElementById("productos");

/* 🛒 CARRITO SIMPLE (EL QUE YA TENÍAS) */
window.agregarCarrito = function(nombre, precio) {
  alert(`Agregado al carrito: ${nombre} - $${precio}`);
};

/* 📦 CARGAR PRODUCTOS */
async function cargarProductos() {
  const snapshot = await getDocs(collection(db, "productos"));

  contenedor.innerHTML = "";

  snapshot.forEach((doc) => {
    const p = doc.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <!-- 👇 AQUÍ SE MUESTRA LA IMAGEN -->
      <img src="${p.imagen}" alt="${p.Nombre}">

      <h3>${p.Nombre}</h3>
      <p>Precio: $${p.Precio}</p>
      <p>Stock: ${p.stock}</p>

      ${
        p.stock > 0
          ? `<button onclick="agregarCarrito('${p.Nombre}', ${p.Precio})">
               Agregar al carrito
             </button>`
          : `<button disabled>Agotado</button>`
      }
    `;

    contenedor.appendChild(card);
  });
}

cargarProductos();
