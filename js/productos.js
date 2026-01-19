import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

async function cargarProductos() {
  try {
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    snapshot.forEach(doc => {
      const p = doc.data();

      // Stock y estado
      const cantidad = p.stock || 0;
      const estado = cantidad > 0 ? "Disponible" : "AGOTADO";

      // Botón
      const boton = cantidad > 0
        ? `<button onclick="agregarCarrito('${doc.id}', '${p.Nombre}', ${p.Precio})">Agregar al carrito</button>`
        : `<button disabled>AGOTADO</button>`;

      // Mostrar producto
      contenedor.innerHTML += `
        <div class="card">
          <h3>${p.Nombre}</h3>
          <p>Precio: $${p.Precio}</p>
          <p>Stock: ${cantidad}</p>
          ${boton}
        </div>
      `;
    });

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Ejecutar al cargar
cargarProductos();

// Carrito básico con localStorage
window.agregarCarrito = function(id, nombre, precio) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existe = carrito.find(p => p.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`${nombre} agregado al carrito`);
}
