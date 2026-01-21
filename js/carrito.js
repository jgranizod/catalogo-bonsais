import { db } from "./firebase.js";
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const WHATSAPP_NUMERO = "593985700805";

// Cola para evitar carreras
let colaOperaciones = Promise.resolve();

// Cache del carrito en memoria
let carritoCache = null;

// Bloqueo por producto (evita spam rapido)
const bloqueados = new Set();

function enCola(tarea) {
  colaOperaciones = colaOperaciones.then(tarea, tarea).catch((e) => {
    console.error("Error en carrito:", e);
  });
  return colaOperaciones;
}

function obtenerCarrito() {
  if (carritoCache) return carritoCache;
  const carrito = localStorage.getItem("carritoServigreen");
  carritoCache = carrito ? JSON.parse(carrito) : [];
  return carritoCache;
}

function guardarCarrito(carrito) {
  carritoCache = carrito;
  localStorage.setItem("carritoServigreen", JSON.stringify(carrito));
  actualizarContador();
}

async function ajustarStock(id, delta) {
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, "productos", id);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("producto-no-encontrado");

      const data = snap.data();
      const stockActual = Number(data.stock ?? 0);
      const stockNuevo = stockActual + delta;
      if (stockNuevo < 0) throw new Error("stock-insuficiente");

      transaction.update(ref, { stock: stockNuevo });
    });
    return true;
  } catch (error) {
    if (error.message === "stock-insuficiente") {
      alert("No hay mas stock disponible");
      return false;
    }
    console.error("Error al actualizar stock:", error);
    alert("Error al actualizar el stock. Intenta de nuevo.");
    return false;
  }
}

window.agregarAlCarrito = function(id, nombre, precio, imagen, stock) {
  return enCola(async () => {
    if (bloqueados.has(id)) return;
    bloqueados.add(id);

    try {
      const ok = await ajustarStock(id, -1);
      if (!ok) return;

      const carrito = obtenerCarrito();
      const productoExistente = carrito.find((item) => item.id === id);

      if (productoExistente) {
        productoExistente.cantidad++;
      } else {
        carrito.push({
          id,
          nombre,
          precio: parseFloat(precio),
          imagen,
          cantidad: 1
        });
      }

      guardarCarrito(carrito);
      mostrarNotificacion("Producto agregado al carrito");

      const sidebar = document.getElementById("carrito-sidebar");
      if (sidebar && sidebar.classList.contains("abierto")) {
        renderizarCarrito();
      }
    } finally {
      bloqueados.delete(id);
    }
  });
};

window.aumentarCantidad = function(id) {
  return enCola(async () => {
    if (bloqueados.has(id)) return;
    bloqueados.add(id);

    try {
      const ok = await ajustarStock(id, -1);
      if (!ok) return;

      const carrito = obtenerCarrito();
      const producto = carrito.find((item) => item.id === id);
      if (!producto) return;

      producto.cantidad++;
      guardarCarrito(carrito);
      renderizarCarrito();
    } finally {
      bloqueados.delete(id);
    }
  });
};

window.disminuirCantidad = function(id) {
  return enCola(async () => {
    if (bloqueados.has(id)) return;
    bloqueados.add(id);

    try {
      const ok = await ajustarStock(id, 1);
      if (!ok) return;

      let carrito = obtenerCarrito();
      const producto = carrito.find((item) => item.id === id);
      if (!producto) return;

      if (producto.cantidad > 1) {
        producto.cantidad--;
      } else {
        carrito = carrito.filter((item) => item.id !== id);
      }

      guardarCarrito(carrito);
      renderizarCarrito();
    } finally {
      bloqueados.delete(id);
    }
  });
};

window.eliminarDelCarrito = function(id) {
  return enCola(async () => {
    if (bloqueados.has(id)) return;
    bloqueados.add(id);

    try {
      const carrito = obtenerCarrito();
      const producto = carrito.find((item) => item.id === id);
      if (!producto) return;

      const ok = await ajustarStock(id, producto.cantidad);
      if (!ok) return;

      const nuevo = carrito.filter((item) => item.id !== id);
      guardarCarrito(nuevo);
      renderizarCarrito();
      mostrarNotificacion("Producto eliminado");
    } finally {
      bloqueados.delete(id);
    }
  });
};

async function limpiarCarrito(restaurarStock) {
  const carrito = obtenerCarrito();

  if (restaurarStock) {
    for (const item of carrito) {
      const ok = await ajustarStock(item.id, item.cantidad);
      if (!ok) return false;
    }
  }

  carritoCache = [];
  localStorage.removeItem("carritoServigreen");
  actualizarContador();
  renderizarCarrito();
  return true;
}

window.vaciarCarrito = function() {
  return enCola(async () => {
    if (!confirm("Estas seguro de vaciar el carrito?")) return;

    const ok = await limpiarCarrito(true);
    if (ok) mostrarNotificacion("Carrito vaciado");
  });
};

function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function actualizarContador() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  document.querySelectorAll("#carrito-count, .carrito-count").forEach((el) => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? "inline-block" : "none";
  });
}

function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("carrito-items");
  const footer = document.getElementById("carrito-footer");
  if (!contenedor || !footer) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <div class="carrito-vacio-icon">Carrito</div>
        <p>Tu carrito esta vacio</p>
        <a href="catalogo.html" class="btn-seguir-comprando">Ver Catalogo</a>
      </div>
    `;
    footer.style.display = "none";
    return;
  }

  contenedor.innerHTML = "";
  carrito.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "carrito-item";
    itemDiv.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
      <div class="carrito-item-info">
        <h4>${item.nombre}</h4>
        <p class="carrito-item-precio">$${item.precio.toFixed(2)}</p>
        <div class="carrito-item-cantidad">
          <button onclick="disminuirCantidad('${item.id}')" class="btn-cantidad">-</button>
          <span>${item.cantidad}</span>
          <button onclick="aumentarCantidad('${item.id}')" class="btn-cantidad">+</button>
        </div>
      </div>
      <div class="carrito-item-acciones">
        <p class="carrito-item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</p>
        <button onclick="eliminarDelCarrito('${item.id}')" class="btn-eliminar">X</button>
      </div>
    `;
    contenedor.appendChild(itemDiv);
  });

  const total = calcularTotal();
  document.getElementById("carrito-total").textContent = `$${total.toFixed(2)}`;
  footer.style.display = "block";
}

window.toggleCarrito = function() {
  const sidebar = document.getElementById("carrito-sidebar");
  const overlay = document.getElementById("carrito-overlay");
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("abierto");
  overlay.classList.toggle("activo");
  document.body.style.overflow = sidebar.classList.contains("abierto") ? "hidden" : "";

  if (sidebar.classList.contains("abierto")) renderizarCarrito();
};

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("carrito-overlay");
  if (overlay) overlay.addEventListener("click", toggleCarrito);
  actualizarContador();
});

window.checkoutWhatsApp = function() {
  return enCola(async () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("El carrito esta vacio");
      return;
    }

    let mensaje = "*NUEVO PEDIDO - SERVIGREEN*\\n\\n";
    mensaje += "*PRODUCTOS:*\\n";
    mensaje += "------------------------------\\n";

    carrito.forEach((item, index) => {
      mensaje += (index + 1) + ". *" + item.nombre + "*\\n";
      mensaje += "   Cantidad: " + item.cantidad + "\\n";
      mensaje += "   Precio: $" + item.precio.toFixed(2) + "\\n";
      mensaje += "   Subtotal: $" + (item.precio * item.cantidad).toFixed(2) + "\\n\\n";
    });

    const total = calcularTotal();
    mensaje += "------------------------------\\n";
    mensaje += "*TOTAL: $" + total.toFixed(2) + "*\\n\\n";
    mensaje += "Por favor, confirma tu direccion de entrega.";

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + mensajeCodificado;
    window.open(urlWhatsApp, "_blank");

    setTimeout(async () => {
      if (confirm("Deseas vaciar el carrito?")) {
        await limpiarCarrito(false);
        toggleCarrito();
      }
    }, 1000);
  });
};

function mostrarNotificacion(mensaje) {
  const notif = document.createElement("div");
  notif.className = "notificacion";
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("mostrar");
  }, 10);

  setTimeout(() => {
    notif.classList.remove("mostrar");
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}
