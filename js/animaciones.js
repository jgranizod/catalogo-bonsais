diff --git a/js/animaciones.js b/js/animaciones.js
index ccfa4a0c728e0260c05d5dd1b8b4683cdc464f03..0abafcaf111aca399d978603820849d08ddcce13 100644
--- a/js/animaciones.js
+++ b/js/animaciones.js
@@ -68,51 +68,57 @@ class ModalVistaRapida {
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
-        agregarAlCarrito(this.currentProduct.id, cantidad);
+        agregarAlCarrito(
+          this.currentProduct.id,
+          this.currentProduct.nombre,
+          this.currentProduct.precio,
+          this.currentProduct.imagen,
+          this.currentProduct.stock
+        );
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
@@ -155,111 +161,92 @@ class ModalVistaRapida {
 
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
 
-// ===== FUNCIÓN PARA RENDERIZAR PRODUCTOS CON MEJORAS =====
+// ===== UTILIDAD PARA OBTENER PRODUCTO DESDE DATASET =====
 
-function renderizarProductoMejorado(producto, index) {
-  return `
-    <div class="producto-card" style="animation-delay: ${index * 0.1}s">
-      <div class="producto-imagen-container" onclick="modalVista.abrir(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
-        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
-        <div class="quick-view-icon">👁</div>
-      </div>
-      <div class="producto-info">
-        <span class="producto-categoria">${producto.categoria || 'General'}</span>
-        <h3 class="producto-nombre">${producto.nombre}</h3>
-        <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
-        <button class="btn-agregar-carrito" onclick="agregarAlCarrito('${producto.id}', 1)">
-          🛒 Agregar al Carrito
-        </button>
-      </div>
-    </div>
-  `;
-}
-
-// ===== FUNCIÓN PARA CARGAR PRODUCTOS DESDE FIREBASE =====
+function obtenerProductoDesdeElemento(elemento) {
+  if (!elemento) {
+    return null;
+  }
 
-function cargarProductosConAnimacion() {
-  // Asumiendo que tienes una referencia a tu base de datos de Firebase
-  // Ajusta según tu configuración actual
-  
-  const productosContainer = document.getElementById('productos-container');
-  productosContainer.innerHTML = '<p>Cargando productos...</p>';
-  
-  // Ejemplo con Firebase (ajusta según tu código actual):
-  /*
-  db.collection('productos').get().then((snapshot) => {
-    productosContainer.innerHTML = '';
-    snapshot.docs.forEach((doc, index) => {
-      const producto = { id: doc.id, ...doc.data() };
-      productosContainer.innerHTML += renderizarProductoMejorado(producto, index);
-    });
-  });
-  */
-  
-  // Si usas un array local de productos:
-  /*
-  productosContainer.innerHTML = '';
-  productos.forEach((producto, index) => {
-    productosContainer.innerHTML += renderizarProductoMejorado(producto, index);
-  });
-  */
+  return {
+    id: elemento.dataset.id || '',
+    nombre: elemento.dataset.nombre || 'Producto',
+    precio: parseFloat(elemento.dataset.precio || '0'),
+    imagen: elemento.dataset.imagen || '',
+    stock: parseInt(elemento.dataset.stock || '0', 10),
+    categoria: elemento.dataset.categoria || 'General',
+    descripcion: elemento.dataset.descripcion || ''
+  };
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
 
-  document.querySelectorAll('.producto-card').forEach(card => {
+  document.querySelectorAll('.producto').forEach(card => {
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
-  // Descomentar si quieres cargar productos automáticamente:
-  // cargarProductosConAnimacion();
-  // setTimeout(animarAlScroll, 100);
+  setTimeout(animarAlScroll, 100);
+});
+
+// ===== EVENTOS DE VISTA RÁPIDA =====
+
+document.addEventListener('click', (event) => {
+  const boton = event.target.closest('[data-accion="vista-rapida"]');
+  if (!boton) {
+    return;
+  }
+
+  const tarjeta = boton.closest('.producto');
+  const producto = obtenerProductoDesdeElemento(tarjeta);
+  if (producto) {
+    modalVista.abrir(producto);
+  }
 });
