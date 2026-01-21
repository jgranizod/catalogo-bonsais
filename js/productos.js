import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todosLosProductos = [];
let productoActual = null;

// 📦 Cargar productos desde Firebase
async function cargarProductos() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    todosLosProductos = [];

    snapshot.forEach((doc) => {
      todosLosProductos.push({ id: doc.id, ...doc.data() });
    });

    mostrarProductos(todosLosProductos, "productos");
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
}

// 📋 Mostrar productos
function mostrarProductos(productos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = "";
  productos.forEach((p) => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
}

// 🎨 Tarjeta (CLICK ABRE MODAL)
function crearTarjetaProducto(p) {
  const card = document.createElement("div");
  card.className = "producto";

  card.innerHTML = `
    <img src="${p.imagen}" class="producto-img">
    <h3>${p.Nombre}</h3>
    <p>$${p.Precio}</p>
  `;

  card.onclick = () => abrirModal(p);
  return card;
}

// 🪟 MODAL SIMPLE
window.abrirModal = function (p) {
  productoActual = p;

  document.getElementById("modalProducto").style.display = "block";
  document.getElementById("modalImagen").src = p.imagen;
  document.getElementById("modalNombre").innerText = p.Nombre;
  document.getElementById("modalPrecio").innerText = p.Precio;
  document.getElementById("modalCategoria").innerText = p.categoria;
  document.getElementById("modalStock").innerText = p.stock;
};

window.cerrarModal = function () {
  document.getElementById("modalProducto").style.display = "none";
  productoActual = null;
};

// 🔍 Filtro
window.filtrar = function (categoria) {
  const filtrados =
    categoria === "todos"
      ? todosLosProductos
      : todosLosProductos.filter((p) => p.categoria === categoria);

  mostrarProductos(filtrados, "productos");
};

cargarProductos();
