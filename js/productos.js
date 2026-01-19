import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Contenedor donde se mostrarán los productos
const contenedor = document.getElementById("productos");

async function cargarProductos() {
  try {
    // Referencia a la colección productos
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    snapshot.forEach(doc => {
      const p = doc.data();

      // Si stock = 0 o producto no activo, no mostrar
      if (!p.activo || p.stock <= 0) return;

      // Crear tarjeta del producto
      contenedor.innerHTML += `
        <div class="card">
          <img src="${p.imagen}" width="150">
          <h3>${p.nombre}</h3>
          <p>Precio: $${p.precio}</p>
          <p>Stock: ${p.stock}</p>
          <button onclick="agregarCarrito('${doc.id}')">Agregar al carrito</button>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Ejecutar la función al cargar el script
cargarProductos();

// Función simple de carrito temporal
window.agregarCarrito = function(id) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existe = carrito.find(p => p.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  localStorage.setItem("carrito",
