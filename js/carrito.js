import { db } from "./firebase.js";
import {
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ÐY>' SISTEMA DE CARRITO CON LOCALSTORAGE

// ConfiguraciÇün
const WHATSAPP_NUMERO = '593985700805'; // ƒsÿ‹÷? CAMBIA ESTE NÇsMERO

// Obtener carrito del localStorage
function obtenerCarrito() {
  const carrito = localStorage.getItem('carritoServigreen');
  return carrito ? JSON.parse(carrito) : [];
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
  localStorage.setItem('carritoServigreen', JSON.stringify(carrito));
  actualizarContador();
}

async function ajustarStock(id, delta) {
  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, "productos", id);
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error("producto-no-encontrado");
      }
      const data = snap.data();
      const stockActual = Number(data.stock ?? 0);
      const stockNuevo = stockActual + delta;
      if (stockNuevo < 0) {
        throw new Error("stock-insuficiente");
      }
      transaction.update(ref, { stock: stockNuevo });
    });
    return true;
  } catch (error) {
    if (error.message === "stock-insuficiente") {
      alert("ƒsÿ‹÷? No hay mÇ­s stock disponible");
      return false;
    }
    console.error("Error al actualizar stock:", error);
    alert("OcurriÇü un error al actualizar el stock. Intenta de nuevo.");
    return false;
  }
}

// Agregar producto al carrito
window.agregarAlCarrito = async function(id, nombre, precio, imagen, stock) {
  let carrito = obtenerCarrito();
  
  // Buscar si el producto ya existe
  const productoExistente = carrito.find(item => item.id === id);
  
  if (productoExistente) {
    // Verificar stock
    if (productoExistente.cantidad >= stock) {
      alert('ƒsÿ‹÷? No hay mÇ­s stock disponible');
      return;
    }
    const ok = await ajustarStock(id, -1);
    if (!ok) return;
    productoExistente.cantidad++;
  } else {
    const ok = await ajustarStock(id, -1);
    if (!ok) return;
    carrito.push({
      id,
      nombre,
      precio: parseFloat(precio),
      imagen,
      cantidad: 1,
      stock
    });
  }
  
  guardarCarrito(carrito);
  mostrarNotificacion('ƒo. Producto agregado al carrito');
  
  // Si el sidebar estÇ­ abierto, actualizar vista
  if (document.getElementById('carrito-sidebar').classList.contains('abierto')) {
    renderizarCarrito();
  }
};

// Aumentar cantidad
window.aumentarCantidad = async function(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id === id);
  
  if (producto) {
    if (producto.cantidad >= producto.stock) {
      alert('ƒsÿ‹÷? No hay mÇ­s stock disponible');
      return;
    }
    const ok = await ajustarStock(id, -1);
    if (!ok) return;
    producto.cantidad++;
    guardarCarrito(carrito);
    renderizarCarrito();
  }
};

// Disminuir cantidad
window.disminuirCantidad = async function(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id === id);
  
  if (producto) {
    const ok = await ajustarStock(id, 1);
    if (!ok) return;
    if (producto.cantidad > 1) {
      producto.cantidad--;
    } else {
      // Si es 1, eliminar producto
      carrito = carrito.filter(item => item.id !== id);
    }
    guardarCarrito(carrito);
    renderizarCarrito();
  }
};

// Eliminar producto del carrito
window.eliminarDelCarrito = async function(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id === id);
  if (producto) {
    const ok = await ajustarStock(id, producto.cantidad);
    if (!ok) return;
  }
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito(carrito);
  renderizarCarrito();
  mostrarNotificacion('ÐY-'‹÷? Producto eliminado');
};

async function limpiarCarrito(restaurarStock) {
  if (restaurarStock) {
    const carrito = obtenerCarrito();
    for (const item of carrito) {
      const ok = await ajustarStock(item.id, item.cantidad);
      if (!ok) return false;
    }
  }
  localStorage.removeItem('carritoServigreen');
  actualizarContador();
  renderizarCarrito();
  return true;
}

// Vaciar carrito
window.vaciarCarrito = async function() {
  if (confirm('¶¨EstÇ­s seguro de vaciar el carrito?')) {
    const ok = await limpiarCarrito(true);
    if (ok) {
      mostrarNotificacion('ÐY-'‹÷? Carrito vaciado');
    }
  }
};

// Calcular total
function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Actualizar contador del carrito
function actualizarContador() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  // Actualizar todos los contadores en la pÇ­gina
  document.querySelectorAll('#carrito-count, .carrito-count').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

// Renderizar carrito en el sidebar
function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById('carrito-items');
  const footer = document.getElementById('carrito-footer');
  
  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <div class="carrito-vacio-icon">ÐY>'</div>
        <p>Tu carrito estÇ­ vacÇðo</p>
        <a href="catalogo.html" class="btn-seguir-comprando">Ver CatÇ­logo</a>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }
  
  contenedor.innerHTML = '';
  
  carrito.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'carrito-item';
    itemDiv.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
      <div class="carrito-item-info">
        <h4>${item.nombre}</h4>
        <p class="carrito-item-precio">$${item.precio.toFixed(2)}</p>
        <div class="carrito-item-cantidad">
          <button onclick="disminuirCantidad('${item.id}')" class="btn-cantidad">ƒ^'</button>
          <span>${item.cantidad}</span>
          <button onclick="aumentarCantidad('${item.id}')" class="btn-cantidad">+</button>
        </div>
      </div>
      <div class="carrito-item-acciones">
        <p class="carrito-item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</p>
        <button onclick="eliminarDelCarrito('${item.id}')" class="btn-eliminar">ÐY-'‹÷?</button>
      </div>
    `;
    contenedor.appendChild(itemDiv);
  });
  
  // Mostrar total
  const total = calcularTotal();
  document.getElementById('carrito-total').textContent = `$${total.toFixed(2)}`;
  footer.style.display = 'block';
}

// Toggle carrito sidebar
window.toggleCarrito = function() {
  const sidebar = document.getElementById('carrito-sidebar');
  const overlay = document.getElementById('carrito-overlay');
  
  sidebar.classList.toggle('abierto');
  overlay.classList.toggle('activo');
  document.body.style.overflow = sidebar.classList.contains('abierto') ? 'hidden' : '';
  
  if (sidebar.classList.contains('abierto')) {
    renderizarCarrito();
  }
};

// Cerrar carrito al hacer click en overlay
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('carrito-overlay');
  if (overlay) {
    overlay.addEventListener('click', toggleCarrito);
  }
  
  // Actualizar contador al cargar pÇ­gina
  actualizarContador();
});

// Proceder al checkout por WhatsApp
window.checkoutWhatsApp = async function() {
  const carrito = obtenerCarrito();
  
  if (carrito.length === 0) {
    alert('El carrito estÇ­ vacÇðo');
    return;
  }
  
  // Construir mensaje para WhatsApp
  let mensaje = 'ÐYO¨ *NUEVO PEDIDO - SERVIGREEN*\n\n';
  mensaje += 'ÐY"Ý *PRODUCTOS:*\n';
  mensaje += 'ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?\n';
  
  carrito.forEach((item, index) => {
    mensaje += `${index + 1}. *${item.nombre}*\n`;
    mensaje += `   Cantidad: ${item.cantidad}\n`;
    mensaje += `   Precio: $${item.precio.toFixed(2)}\n`;
    mensaje += `   Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
  });
  
  const total = calcularTotal();
  mensaje += 'ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?ƒ"?\n';
  mensaje += `ÐY'ø *TOTAL: $${total.toFixed(2)}*\n\n`;
  mensaje += 'ÐY"? Por favor, confirma tu direcciÇün de entrega.';
  
  // Codificar mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeCodificado}`;
  
  // Abrir WhatsApp
  window.open(urlWhatsApp, '_blank');
  
  // Preguntar si quiere vaciar el carrito
  setTimeout(async () => {
    if (confirm('¶¨Deseas vaciar el carrito?')) {
      await limpiarCarrito(false);
      toggleCarrito();
    }
  }, 1000);
};

// Mostrar notificaciÇün
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.className = 'notificacion';
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('mostrar');
  }, 10);
  
  setTimeout(() => {
    notif.classList.remove('mostrar');
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}
