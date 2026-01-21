// ===== CONFIGURACIÓN DEL MODAL =====

class ModalVistaRapida {
  constructor() {
    this.modal = null;
    this.currentProduct = null;
    this.init();
  }

  init() {
    // Crear estructura del modal si no existe
    if (!document.getElementById('modal-vista-rapida')) {
      this.crearModal();
    }
    this.modal = document.getElementById('modal-vista-rapida');
    this.setupEventListeners();
  }

  crearModal() {
    const modalHTML = `
      <div id="modal-vista-rapida" class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close" aria-label="Cerrar">&times;</button>
          <div class="modal-body">
            <div class="modal-imagen-container">
              <img src="" alt="" class="modal-imagen" id="modal-img">
            </div>
            <div class="modal-info">
              <span class="modal-categoria" id="modal-categoria"></span>
              <h2 class="modal-titulo" id="modal-titulo"></h2>
              <p class="modal-precio" id="modal-precio"></p>
              <p class="modal-descripcion" id="modal-descripcion"></p>
              <p class="modal-stock" id="modal-stock"></p>
              <div class="modal-cantidad">
                <span>Cantidad:</span>
                <div class="cantidad-controls">
                  <button class="cantidad-btn" id="modal-decrementar">-</button>
                  <input type="number" class="cantidad-input" id="modal-cantidad" value="1" min="1" readonly>
                  <button class="cantidad-btn" id="modal-incrementar">+</button>
                </div>
              </div>
              <button class="modal-agregar-btn" id="modal-agregar">
                🛒 Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Cerrar modal
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.cerrar());

    // Cerrar al hacer clic fuera del contenido
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.cerrar();
      }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.cerrar();
      }
    });

    // Controles de cantidad
    document.getElementById('modal-decrementar').addEventListener('click', () => {
      const input = document.getElementById('modal-cantidad');
      if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
      }
    });

    document.getElementById('modal-incrementar').addEventListener('click', () => {
      const input = document.getElementById('modal-cantidad');
      const stock = this.currentProduct?.stock || 999;
      if (parseInt(input.value) < stock) {
        input.value = parseInt(input.value) + 1;
      }
    });

    // Agregar al carrito desde el modal
    document.getElementById('modal-agregar').addEventListener('click', () => {
      const cantidad = parseInt(document.getElementById('modal-cantidad').value);
      if (this.currentProduct) {
        // Aquí llamas a tu función existente de agregar al carrito
        agregarAlCarrito(this.currentProduct.id, cantidad);
        this.cerrar();
        // Mostrar notificación
        this.mostrarNotificacion('✅ Producto agregado al carrito');
      }
    });
  }

  abrir(producto) {
    this.currentProduct = producto;
    
    // Llenar datos del modal
    document.getElementById('modal-img').src = producto.imagen;
    document.getElementById('modal-img').alt = producto.nombre;
    document.getElementById('modal-titulo').textContent = producto.nombre;
    document.getElementById('modal-precio').textContent = `$${producto.precio.toFixed(2)}`;
    document.getElementById('modal-descripcion').textContent = producto.descripcion || 'Producto de alta calidad para tu jardín.';
    document.getElementById('modal-categoria').textContent = producto.categoria || 'General';
    
    // Stock
    const stockElement = document.getElementById('modal-stock');
    if (producto.stock > 0) {
      stockElement.textContent = `✓ En stock (${producto.stock} disponibles)`;
      stockElement.className = 'modal-stock disponible';
      document.getElementById('modal-agregar').disabled = false;
    } else {
      stockElement.textContent = '✗ Agotado';
      stockElement.className = 'modal-stock agotado';
      document.getElementById('modal-agregar').disabled = true;
    }

    // Resetear cantidad
    document.getElementById('modal-cantidad').value = 1;

    // Abrir modal
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  cerrar() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.currentProduct = null;
  }

  mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 600;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 2500);
  }
}

// Agregar estilos para notificaciones
const notifStyles = document.createElement('style');
notifStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(notifStyles);

// Inicializar modal
const modalVista = new ModalVistaRapida();

// ===== FUNCIÓN PARA RENDERIZAR PRODUCTOS CON MEJORAS =====

function renderizarProductoMejorado(producto, index) {
  return `
    <div class="producto-card" style="animation-delay: ${index * 0.1}s">
      <div class="producto-imagen-container" onclick="modalVista.abrir(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
        <div class="quick-view-icon">👁</div>
      </div>
      <div class="producto-info">
        <span class="producto-categoria">${producto.categoria || 'General'}</span>
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
        <button class="btn-agregar-carrito" onclick="agregarAlCarrito('${producto.id}', 1)">
          🛒 Agregar al Carrito
        </button>
      </div>
    </div>
  `;
}

// ===== FUNCIÓN PARA CARGAR PRODUCTOS DESDE FIREBASE =====

function cargarProductosConAnimacion() {
  // Asumiendo que tienes una referencia a tu base de datos de Firebase
  // Ajusta según tu configuración actual
  
  const productosContainer = document.getElementById('productos-container');
  productosContainer.innerHTML = '<p>Cargando productos...</p>';
  
  // Ejemplo con Firebase (ajusta según tu código actual):
  /*
  db.collection('productos').get().then((snapshot) => {
    productosContainer.innerHTML = '';
    snapshot.docs.forEach((doc, index) => {
      const producto = { id: doc.id, ...doc.data() };
      productosContainer.innerHTML += renderizarProductoMejorado(producto, index);
    });
  });
  */
  
  // Si usas un array local de productos:
  /*
  productosContainer.innerHTML = '';
  productos.forEach((producto, index) => {
    productosContainer.innerHTML += renderizarProductoMejorado(producto, index);
  });
  */
}

// ===== ANIMACIÓN AL HACER SCROLL =====

function animarAlScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.producto-card').forEach(card => {
    observer.observe(card);
  });
}

// ===== SMOOTH SCROLL PARA NAVEGACIÓN =====

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== INICIALIZAR AL CARGAR LA PÁGINA =====

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Mejoras de animación y modal cargadas');
  // Descomentar si quieres cargar productos automáticamente:
  // cargarProductosConAnimacion();
  // setTimeout(animarAlScroll, 100);
});
