const API_URL = "http://localhost:5000/api/products";

const productsEl = document.getElementById("products");
const loadingEl = document.getElementById("loading");
const listErrorEl = document.getElementById("list-error");
const form = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const formMessage = document.getElementById("form-message");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const refreshBtn = document.getElementById("refresh-btn");
const authStatus = document.getElementById("auth-status");
const loginLink = document.getElementById("login-link");
const logoutBtn = document.getElementById("logout-btn");

const idInput = document.getElementById("product-id");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");

let productsCache = [];

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function refreshAuthUI() {
  const user = getUser();
  if (user && getToken()) {
    authStatus.textContent = `Logged in as ${user.email} (${user.role})`;
    loginLink.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    authStatus.textContent = "Not logged in";
    loginLink.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  refreshAuthUI();
});

async function loadProducts() {
  loadingEl.classList.remove("hidden");
  listErrorEl.classList.add("hidden");
  productsEl.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load products");

    productsCache = await res.json();
    loadingEl.classList.add("hidden");

    if (productsCache.length === 0) {
      productsEl.innerHTML = `<p class="muted">No products yet. Add one above.</p>`;
      return;
    }

    productsEl.innerHTML = productsCache
      .map(
        (p) => `
      <article class="product-card">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || "No description")}</p>
        <div class="meta">
          <span><strong>Price:</strong> $${Number(p.price).toFixed(2)}</span>
          <span><strong>Stock:</strong> ${p.stock}</span>
          <span><strong>ID:</strong> ${p.id}</span>
        </div>
        <div class="card-actions">
          <button type="button" class="secondary" data-edit="${p.id}">Edit</button>
          <button type="button" class="danger" data-delete="${p.id}">Delete</button>
        </div>
      </article>
    `
      )
      .join("");
  } catch (err) {
    loadingEl.classList.add("hidden");
    listErrorEl.textContent =
      "Could not reach API. Is the server running on port 5000?";
    listErrorEl.classList.remove("hidden");
    console.error(err);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  formMessage.classList.remove("error");

  if (!getToken()) {
    formMessage.textContent = "Please login first.";
    formMessage.classList.add("error");
    window.location.href = "login.html";
    return;
  }

  const id = idInput.value;
  const payload = {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    price: Number(priceInput.value),
    stock: Number(stockInput.value || 0),
  };

  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    formMessage.textContent = id ? "Product updated." : "Product created.";
    resetForm();
    await loadProducts();
  } catch (err) {
    formMessage.textContent = err.message;
    formMessage.classList.add("error");
  }
});

productsEl.addEventListener("click", async (e) => {
  const editBtn = e.target.closest("[data-edit]");
  const deleteBtn = e.target.closest("[data-delete]");

  if (editBtn) {
    const id = Number(editBtn.getAttribute("data-edit"));
    const product = productsCache.find((p) => p.id === id);
    if (!product) return;

    idInput.value = product.id;
    nameInput.value = product.name;
    descriptionInput.value = product.description || "";
    priceInput.value = product.price;
    stockInput.value = product.stock;

    formTitle.textContent = "Edit Product";
    submitBtn.textContent = "Update Product";
    cancelBtn.classList.remove("hidden");
    formMessage.textContent = "";
    formMessage.classList.remove("error");
  }

  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-delete");
    if (!getToken()) {
      window.location.href = "login.html";
      return;
    }

    const ok = confirm(`Delete product #${id}?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await loadProducts();
    } catch (err) {
      listErrorEl.textContent = err.message;
      listErrorEl.classList.remove("hidden");
    }
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadProducts);

function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Add Product";
  submitBtn.textContent = "Add Product";
  cancelBtn.classList.add("hidden");
  formMessage.classList.remove("error");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

refreshAuthUI();
loadProducts();
setupSocket();

function setupSocket() {
  const socketStatus = document.getElementById("socket-status");
  const liveFeed = document.getElementById("live-feed");

  // Connect to Socket.io server (same host as API)
  const socket = io("http://localhost:5000");

  socket.on("connect", () => {
    socketStatus.textContent = "Live";
    socketStatus.classList.add("online");

    // Join personal room for user-specific notifications
    const user = getUser();
    if (user?.id) {
      socket.emit("join", user.id);
    }
  });

  socket.on("disconnect", () => {
    socketStatus.textContent = "Offline";
    socketStatus.classList.remove("online");
  });

  // Broadcast: any product created/updated/deleted
  socket.on("product:event", (event) => {
    const name = event.product?.name || `#${event.product?.id}`;
    prependFeed(liveFeed, `${event.type.toUpperCase()}: ${name}`);
    // Refresh list so all open browsers stay in sync
    loadProducts();
  });

  // Personal notification (only if you joined your user room)
  socket.on("notification", (note) => {
    prependFeed(liveFeed, `Notify: ${note.message}`);
  });
}

function prependFeed(listEl, text) {
  if (listEl.querySelector(".muted")) {
    listEl.innerHTML = "";
  }
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
  listEl.prepend(li);

  // Keep feed small for performance
  while (listEl.children.length > 8) {
    listEl.removeChild(listEl.lastChild);
  }
}
