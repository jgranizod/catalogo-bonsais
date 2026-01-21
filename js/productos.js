import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todosLosProductos = [];

// Cargar todos los productos
async function cargarProductos() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));

    todosLosProductos = [];
    snapshot.forEach((doc) => {
      todosLosProductos.push({ id: doc.id, ...doc.data() });
    });

    mostrarDestacados();
    mostrarProductos(todosLosProductos, "productos");
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

function mostrarDestacados() {
  const contenedor = document.getElementById("destacados");
  if (!contenedor) return;

  const destacados = todosLosProductos.slice(0, 4);
  if (destacados.length === 0) {
    contenedor.innerHTML = '<p class="loading">No hay productos disponibles</p>';
    return;
  }

  contenedor.innerHTML = "";
  destacados.forEach((p) => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
}

function mostrarProductos(productos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  if (productos.length === 0) {
    contenedor.innerHTML = '<p class="loading">No hay productos en esta categoria</p>';
    return;
  }

  contenedor.innerHTML = "";
  productos.forEach((p) => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
}

function crearTarjetaProducto(p) {
  const card = document.createElement("div");
  card.className = "producto";

  const nombre = p.Nombre || "";
  const precio = parseFloat(p.Precio || 0).toFixed(2);
  const stock = p.stock ?? 0;
  const imagen = p.imagen || "";
  const categoria = p.categoria || "General";

  card.innerHTML = `
    <img src="${imagen}" alt="${nombre}" class="producto-img"
         onerror="this.src='https://via.placeholder.com/280x280?text=Sin+Imagen'">
    <div class="producto-info">
      <span class="categoria-tag">${categoria}</span>
      <h3>${nombre}</h3>
      <div class="precio-container">
        <span class="precio">$${precio}</span>
      </div>
      <p class="stock">Stock disponible: ${stock}</p>
    </div>
  `;

  return card;
}

cargarProductos();
