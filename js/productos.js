import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

/* 🛒 Función para agregar al carrito */
window.agregarCarrito = function(nombre, precio) {
  // Puedes mejorar esto con un carrito real más adelante
  alert(`✅ Agregado al carrito:\n\n${nombre}\nPrecio: $${precio}`);
};

/* 📦 Función para cargar productos desde Firebase */
async function cargarProductos() {
  try {
    // Mostrar mensaje de carga
    contenedor.innerHTML = '<p class="loading">Cargando productos...</p>';

    // Obtener productos de Firestore
    const snapshot = await getDocs(collection(db, "productos"));
    
    // Limpiar contenedor
    contenedor.innerHTML = "";

    // Verificar si hay productos
    if (snapshot.empty) {
      contenedor.innerHTML = '<p class="loading">No hay productos disponibles</p>';
      return;
    }

    // Recorrer cada producto
    snapshot.forEach((doc) => {
      const p = doc.data();
      
      // Crear tarjeta de producto
      const card = document.createElement("div");
      card.className = "producto";
      
      // Generar HTML del producto
      card.innerHTML = `
        <img 
          src="${p.imagen}" 
          alt="${p.Nombre}" 
          class="producto-img"
          onerror="this.src='images/placeholder.jpg'"
        >
        <div class="producto-info">
          <h3>${p.Nombre}</h3>
          <p class="precio">$${parseFloat(p.Precio).toFixed(2)}</p>
          <p class="stock">Stock disponible: ${p.stock}</p>
          ${
            p.stock > 0
              ? `<button onclick="agregarCarrito('${p.Nombre}', ${p.Precio})">
                   Agregar al carrito
                 </button>`
              : `<button disabled>Agotado</button>`
          }
        </div>
      `;
      
      // Agregar al contenedor
      contenedor.appendChild(card);
    });

    console.log(`✅ ${snapshot.size} productos cargados correctamente`);

  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    contenedor.innerHTML = `
      <p class="loading" style="color: #e74c3c;">
        Error al cargar productos. <br>
        Verifica la consola para más detalles.
      </p>
    `;
  }
}

/* 🚀 Iniciar carga de productos */
cargarProductos();
