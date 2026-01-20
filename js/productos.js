import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

const snapshot = await getDocs(collection(db, "productos"));

snapshot.forEach(doc => {
  const data = doc.data();

  const card = document.createElement("div");
  card.className = "producto";

  const img = document.createElement("img");
  img.className = "producto-img";

  img.src = `/catalogo-bonsais/images/${data.imagen}`;

  const nombre = document.createElement("h3");
  nombre.textContent = data.Nombre;

  const precio = document.createElement("p");
  precio.textContent = `$${data.Precio}`;

  const stock = document.createElement("p");
  stock.textContent = `Stock: ${data.stock}`;

  card.appendChild(img);
  card.appendChild(nombre);
  card.appendChild(precio);
  card.appendChild(stock);

  contenedor.appendChild(card);
});
