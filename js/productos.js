import { db } from "./firebase.js";
import { collection, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");
const productosRef = collection(db, "productos");

/* MAPEO DE IMÁGENES (NO FIREBASE) */
const imagenes = {
    "Bonsai Ficus": "images/bonsai-ficus.jpg",
    "Bonsai Chiflera": "images/chiflera.jpeg",
};

const snapshot = await getDocs(productosRef);

snapshot.forEach(doc => {
    const data = doc.data();

    const img = imagenes[data.Nombre] || "images/default.jpeg";

    const div = document.createElement("div");
    div.className = "producto";

    div.innerHTML = `
        <img src="${img}" alt="${data.Nombre}">
        <h3>${data.Nombre}</h3>
        <p class="precio">$${data.Precio}</p>
        <p class="stock">Stock: ${data.stock}</p>

        ${data.stock > 0 
            ? `<button>Agregar al carrito</button>`
            : `<span class="soldout">Agotado</span>`
        }
    `;

    contenedor.appendChild(div);
});
