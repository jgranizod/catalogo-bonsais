import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todosLosProductos = [];

// 🛒 Agregar al carrito
window.agregarCarrito = function(nombre, precio) {
  alert(`✅ Agregado al carrito:\n\n${nombre}\nPrecio: $${precio}`);
  // Aquí puedes agregar lógica de carrito real después
};

// 📦 Cargar TODOS los productos de Firebase
async function cargarProductos() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    
    todosLosProductos = [];
    snapshot.forEach((doc) => {
      todosLosProductos.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ ${todosLosProductos.length} productos cargados`);
    
    // Mostrar destacados en inicio (primeros 4)
    mostrarDestacados();
    
    // Mostrar todos en catálogo
    mostrarProductos(todosLosProductos, 'productos');

  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
  }
}

// ⭐ Mostrar productos destacados (primeros 4)
function mostrarDestacados() {
  const contenedor = document.getElementById('destacados');
  const destacados = todosLosProductos.slice(0, 4);
  
  if (destacados.length === 0) {
    contenedor.innerHTML = '<p class="loading">No hay productos disponibles</p>';
    return;
  }
  
  contenedor.innerHTML = '';
  destacados.forEach(p => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
}

// 📋 Mostrar productos en contenedor
function mostrarProductos(productos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  
  if (productos.length === 0) {
    contenedor.innerHTML = '<p class="loading">No hay productos en esta categoría</p>';
    return;
  }
  
  contenedor.innerHTML = '';
  productos.forEach(p => {
    contenedor.appendChild(crearTarjetaProducto(p));
  });
}

// 🎨 Crear tarjeta de producto
function crearTarjetaProducto(p) {
  const card = document.createElement('div');
  card.className = 'producto';
  
  card.innerHTML = `
    <img 
      src="${p.imagen}" 
      alt="${p.Nombre}" 
      class="producto-img"
      onerror="this.src='https://via.placeholder.com/280x280?text=Sin+Imagen'"
    >
    <div class="producto-info">
      <span class="categoria-tag">${p.categoria || 'General'}</span>
      <h3>${p.Nombre}</h3>
      <div class="precio-container">
        <span class="precio">$${parseFloat(p.Precio).toFixed(2)}</span>
      </div>
      <p class="stock">Stock disponible: ${p.stock}</p>
      ${
        p.stock > 0
          ? `<button onclick="agregarCarrito('${p.Nombre}', ${p.Precio})">
               Añadir al carrito
             </button>`
          : `<button disabled>Agotado</button>`
      }
    </div>
  `;
  
  return card;
}

// 🔍 Filtrar por categoría
window.filtrar = function(categoria) {
  const filtrados = categoria === 'todos' 
    ? todosLosProductos 
    : todosLosProductos.filter(p => p.categoria === categoria);
  
  mostrarProductos(filtrados, 'productos');
  
  // Marcar botón activo
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.remove('activo');
  });
  event.target.classList.add('activo');
};

// 🚀 Iniciar cuando cargue la página
cargarProductos();
