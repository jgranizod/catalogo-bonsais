import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todosLosProductos = [];
let productoActual = null;

// 🛒 Agregar al carrito (se usa desde el modal)
window.agregarCarrito = function () {
  if (!productoActual) return;
  alert(`✅ Agregado al carrito:\n\n${productoActual.Nombre}\nPrecio: $${productoActual.Precio}`);
};

// 📦 Cargar productos desde Firebase
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
    console.error("❌ Error al cargar productos:", error);
  }
}

// ⭐ Destacados
function mostrarDestacados() {
  const contenedor = document.getElementById("destacados");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  todosLosProductos.slice(0, 4).forEach((p) => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
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

// 🎨 Tarjeta de producto (CLICK ABRE MODAL)
function crearTarjetaProducto(p) {
  const card = document.createElement("div");
  card.className = "producto";

  card.innerHTML = `
    <img src="${p.imagenes?.[0] || p.imagen}" class="producto-img">
    <div class="producto-info">
      <span class="categoria-tag">${p.categoria || "General"}</span>
      <h3>${p.Nombre}</h3>
      <span class="precio">$${parseFloat(p.Precio).toFixed(2)}</span>
    </div>
  `;

  card.onclick = () => abrirModal(p);
  return card;
}

// 🪟 MODAL
window.abrirModal = function (p) {
  productoActual = p;

  document.getElementById("modalProducto").style.display = "flex";
  document.getElementById("m-nombre").innerText = p.Nombre;
  document.getElementById("m-precio").innerText = `$${p.Precio}`;
  document.getElementById("m-descripcion").innerText = p.descripcion_larga || "";

  const imgPrincipal = document.getElementById("m-img-principal");
  imgPrincipal.src = p.imagenes?.[0] || p.imagen;

  const mini = document.getElementById("m-miniaturas");
  mini.innerHTML = "";

  (p.imagenes || []).forEach((img) => {
    const i = document.createElement("img");
    i.src = img;
    i.onclick = () => (imgPrincipal.src = img);
    mini.appendChild(i);
  });

  const ul = document.getElementById("m-specs");
  ul.innerHTML = "";

  if (p.especificaciones) {
    Object.entries(p.especificaciones).forEach(([k, v]) => {
      ul.innerHTML += `<li><b>${k}:</b> ${v}</li>`;
    });
  }

  document.getElementById("btnWs").href =
    `https://wa.me/593XXXXXXXXX?text=Hola,%20quiero%20el%20${encodeURIComponent(p.Nombre)}`;
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
