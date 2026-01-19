import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  try {
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    snapshot.forEach(doc => {
      const p = doc.data();

      // Mostrar solo nombre y precio
      contenedor.innerHTML += `
        <div class="card">
          <h3>${p.nombre}</h3>
          <p>Precio: $${p.precio}</p>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Ejecutar al cargar la página
cargarProductos();
