import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "producto";

    div.innerHTML = `
      <img src="${data.imagen}" class="producto-img">
      <h3>${data.Nombre}</h3>
      <p>Precio: $${data.Precio}</p>
      <p class="stock">Stock: ${data.stock}</p>
      <button ${data.stock <= 0 ? "disabled" : ""}>
        ${data.stock <= 0 ? "Agotado" : "Agregar al carrito"}
      </button>
    `;

    contenedor.appendChild(div);
  });
}

cargarProductos();
