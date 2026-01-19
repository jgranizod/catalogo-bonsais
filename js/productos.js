import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));

  contenedor.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const p = doc.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.Nombre}">
      <h3>${p.Nombre}</h3>
      <p>Precio: $${p.Precio}</p>
      <p>Stock: ${p.stock}</p>

      ${
        p.stock > 0
          ? `<button>Agregar al carrito</button>`
          : `<button disabled>Agotado</button>`
      }
    `;

    contenedor.appendChild(card);
  });
}

cargarProductos();
