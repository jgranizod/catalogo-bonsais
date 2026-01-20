import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

/* 🛒 carrito (el tuyo) */
window.agregarCarrito = function(nombre, precio) {
  alert(`Agregado: ${nombre} - $${precio}`);
};

async function cargarProductos() {
  const snapshot = await getDocs(collection(db, "productos"));

  contenedor.innerHTML = "";

  snapshot.forEach((doc) => {
    const p = doc.data();

    const card = document.createElement("div");
    card.className = "card";

    /* 👇 AQUÍ SE MUESTRA LA IMAGEN */
    card.innerHTML = `
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
