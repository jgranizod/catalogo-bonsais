import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, runTransaction, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD92apK91B1M3Jin0p9Jw_68G8uxlsu_Cw",
  authDomain: "catalogo-bonsais.firebaseapp.com",
  projectId: "catalogo-bonsais",
  storageBucket: "catalogo-bonsais.firebasestorage.app",
  messagingSenderId: "733197067098",
  appId: "1:733197067098:web:03babf7f4542468cf68963"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const loginBox = document.getElementById("login-box");
const adminPanel = document.getElementById("admin-panel");
const pedidosList = document.getElementById("pedidos-list");
const msg = document.getElementById("login-msg");

document.getElementById("btn-google").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    msg.textContent = "Error: " + e.message;
  }
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginBox.style.display = "block";
    adminPanel.style.display = "none";
    return;
  }

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    loginBox.style.display = "block";
    adminPanel.style.display = "none";
    msg.textContent = "No tienes permisos de admin.";
    await signOut(auth);
    return;
  }

  loginBox.style.display = "none";
  adminPanel.style.display = "block";
  escucharPedidos();
});

function escucharPedidos() {
  const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    pedidosList.innerHTML = "";
    snap.forEach((docSnap) => {
      const p = docSnap.data();
      if (p.estado !== "pendiente") return;

      const div = document.createElement("div");
      div.style.background = "white";
      div.style.padding = "16px";
      div.style.marginBottom = "12px";
      div.style.borderRadius = "10px";

      div.innerHTML = `
        <b>Pedido:</b> ${docSnap.id}<br/>
        <b>Total:</b> $${p.total?.toFixed(2)}<br/>
        <b>Items:</b> ${p.items?.length || 0}<br/>
        <button class="btn-enviar" data-id="${docSnap.id}">Confirmar</button>
        <button class="btn-secundario" data-cancel="${docSnap.id}">Cancelar</button>
      `;

      div.querySelector("[data-id]").addEventListener("click", () => confirmarPedido(docSnap.id, p.items));
      div.querySelector("[data-cancel]").addEventListener("click", () => cancelarPedido(docSnap.id));

      pedidosList.appendChild(div);
    });
  });
}

async function confirmarPedido(pedidoId, items) {
  try {
    await runTransaction(db, async (transaction) => {
      for (const item of items) {
        const ref = doc(db, "productos", item.id);
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw new Error("producto-no-existe");
        const data = snap.data();
        const stock = Number(data.stock ?? 0);
        if (stock - item.cantidad < 0) throw new Error("stock-insuficiente");
        transaction.update(ref, { stock: stock - item.cantidad });
      }
      transaction.update(doc(db, "pedidos", pedidoId), { estado: "confirmado" });
    });
    alert("Pedido confirmado y stock descontado");
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function cancelarPedido(pedidoId) {
  await updateDoc(doc(db, "pedidos", pedidoId), { estado: "cancelado" });
}
