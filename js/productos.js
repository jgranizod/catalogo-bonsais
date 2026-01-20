import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

/* 🛒 Función para agregar al carrito */
window.agregarCarrito = function(nombre, precio) {
  alert(`Agregado: ${nombre} - $${precio}`);
};

async function cargarProductos() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    contenedor.innerHTML = "";
    
    snapshot.forEach((doc) => {
      const p = doc.data();
      const card = document.createElement("div");
      card.className = "producto"; // ✅ CAMBIO: "card" → "producto"
      
      /* 👇 Imagen con clase correcta */
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.Nombre}" class="producto-img">
        <h3>${p.Nombre}</h3>
        <p>Precio: $${p.Precio}</p>
        <p class="stock">Stock: ${p.stock}</p>
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
  } catch (error) {
    console.error("Error al cargar productos:", error);
    contenedor.innerHTML = "<p>Error al cargar productos. Verifica la consola.</p>";
  }
}

cargarProductos();
