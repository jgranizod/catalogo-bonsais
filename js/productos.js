import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  contenedor.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // ✅ RUTA CORRECTA DESDE /js/
    const imgSrc = data.imagen && data.imagen.trim() !== ""
      ? `../${data.imagen}`
      : "../images/default.jpeg";

    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <img src="${imgSrc}" alt="${data.Nombre}">
      <h3>${data.Nombre}</h3>
      <p class="precio">$${data.Precio}</p>
      <p class="stock">Stock: ${data.stock}</p>
    `;

    contenedor.appendChild(div);
  });
}

cargarProductos();
