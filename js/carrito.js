// 🛒 SISTEMA DE CARRITO CON LOCALSTORAGE

// Configuración
const WHATSAPP_NUMERO = '593986500805'; // ⚠️ CAMBIA ESTE NÚMERO

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

// Agregar producto al carrito
window.agregarAlCarrito = function(id, nombre, precio, imagen, stock) {
  let carrito = obtenerCarrito();
  
  // Buscar si el producto ya existe
  const productoExistente = carrito.find(item => item.id === id);
  
  if (productoExistente) {
    // Verificar stock
    if (productoExistente.cantidad >= stock) {
      alert('⚠️ No hay más stock disponible');
      return;
    }
    productoExistente.cantidad++;
  } else {
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
  mostrarNotificacion('✅ Producto agregado al carrito');
  
  // Si el sidebar está abierto, actualizar vista
  if (document.getElementById('carrito-sidebar').classList.contains('abierto')) {
    renderizarCarrito();
  }
};

// Aumentar cantidad
window.aumentarCantidad = function(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id === id);
  
  if (producto) {
    if (producto.cantidad >= producto.stock) {
      alert('⚠️ No hay más stock disponible');
      return;
    }
    producto.cantidad++;
    guardarCarrito(carrito);
    renderizarCarrito();
  }
};

// Disminuir cantidad
window.disminuirCantidad = function(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(item => item.id === id);
  
  if (producto) {
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
window.eliminarDelCarrito = function(id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito(carrito);
  renderizarCarrito();
  mostrarNotificacion('🗑️ Producto eliminado');
};

// Vaciar carrito
window.vaciarCarrito = function() {
  if (confirm('¿Estás seguro de vaciar el carrito?')) {
    localStorage.removeItem('carritoServigreen');
    actualizarContador();
    renderizarCarrito();
    mostrarNotificacion('🗑️ Carrito vaciado');
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
  
  // Actualizar todos los contadores en la página
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
        <div class="carrito-vacio-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <a href="catalogo.html" class="btn-seguir-comprando">Ver Catálogo</a>
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
          <button onclick="disminuirCantidad('${item.id}')" class="btn-cantidad">−</button>
          <span>${item.cantidad}</span>
          <button onclick="aumentarCantidad('${item.id}')" class="btn-cantidad">+</button>
        </div>
      </div>
      <div class="carrito-item-acciones">
        <p class="carrito-item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</p>
        <button onclick="eliminarDelCarrito('${item.id}')" class="btn-eliminar">🗑️</button>
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
  
  // Actualizar contador al cargar página
  actualizarContador();
});

// Proceder al checkout por WhatsApp
window.checkoutWhatsApp = function() {
  const carrito = obtenerCarrito();
  
  if (carrito.length === 0) {
    alert('El carrito está vacío');
    return;
  }
  
  // Construir mensaje para WhatsApp
  let mensaje = '🌿 *NUEVO PEDIDO - SERVIGREEN*\n\n';
  mensaje += '📦 *PRODUCTOS:*\n';
  mensaje += '━━━━━━━━━━━━━━━━\n';
  
  carrito.forEach((item, index) => {
    mensaje += `${index + 1}. *${item.nombre}*\n`;
    mensaje += `   Cantidad: ${item.cantidad}\n`;
    mensaje += `   Precio: $${item.precio.toFixed(2)}\n`;
    mensaje += `   Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
  });
  
  const total = calcularTotal();
  mensaje += '━━━━━━━━━━━━━━━━\n';
  mensaje += `💰 *TOTAL: $${total.toFixed(2)}*\n\n`;
  mensaje += '📍 Por favor, confirma tu dirección de entrega.';
  
  // Codificar mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeCodificado}`;
  
  // Abrir WhatsApp
  window.open(urlWhatsApp, '_blank');
  
  // Preguntar si quiere vaciar el carrito
  setTimeout(() => {
    if (confirm('¿Deseas vaciar el carrito?')) {
      localStorage.removeItem('carritoServigreen');
      actualizarContador();
      toggleCarrito();
    }
  }, 1000);
};

// Mostrar notificación
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
