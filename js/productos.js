import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  try {
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    snapshot.forEach(doc => {
      const p = doc.data();

      // Mostrar nombre y precio respetando mayúsculas
      contenedor.innerHTML += `
        <div class="card">
          <h3>${p.Nombre}</h3>
          <p>Precio: $${p.Precio}</p>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Ejecutar al cargar la página
cargarProductos();
