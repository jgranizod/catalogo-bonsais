import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contenedor = document.getElementById("productos");

const querySnapshot = await getDocs(collection(db, "productos"));

querySnapshot.forEach((doc) => {
  const data = doc.data();

  const card = document.createElement("div");
  card.className = "producto";

  const img = document.createElement("img");
  img.className = "producto-img";

  if (data.imagen) {
    img.src = `../images/${data.imagen.trim()}`;
  } else {
    img.src = "../images/default.jpeg";
  }

  const nombre = document.createElement("h3");
  nombre.textContent = data.Nombre;

  const precio = document.createElement("p");
  precio.textContent = `$${data.Precio}`;

  const stock = document.createElement("p");
  stock.className = "stock";
  stock.textContent = data.stock > 0 ? `Stock: ${data.stock}` : "AGOTADO";

  card.appendChild(img);
  card.appendChild(nombre);
  card.appendChild(precio);
  card.appendChild(stock);

  contenedor.appendChild(card);
});
