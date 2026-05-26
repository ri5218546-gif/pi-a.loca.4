const state = {
  user: JSON.parse(localStorage.getItem("pina_user") || "null"),
  token: localStorage.getItem("pina_token"),
  route: "store",
  authMode: "login",
  products: [],
  categories: [],
  workers: [],
  trucks: [],
  trips: [],
  driverTrips: []
};

const els = {
  navLinks: document.querySelector("#navLinks"),
  menuButton: document.querySelector("#menuButton"),
  authButton: document.querySelector("#authButton"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  closeAuth: document.querySelector("#closeAuth"),
  authTitle: document.querySelector("#authTitle"),
  authName: document.querySelector("#authName"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authAlert: document.querySelector("#authAlert"),
  switchAuth: document.querySelector("#switchAuth"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  promotionFilter: document.querySelector("#promotionFilter"),
  productGrid: document.querySelector("#productGrid"),
  storeToolbar: document.querySelector("#storeToolbar"),
  hero: document.querySelector("#hero"),
  cartView: document.querySelector("#cartView"),
  cartItems: document.querySelector("#cartItems"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  cartDiscount: document.querySelector("#cartDiscount"),
  cartTotal: document.querySelector("#cartTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  historyView: document.querySelector("#historyView"),
  invoiceHistory: document.querySelector("#invoiceHistory"),
  driverView: document.querySelector("#driverView"),
  driverTrips: document.querySelector("#driverTrips"),
  driverReports: document.querySelector("#driverReports"),
  driverReportHistory: document.querySelector("#driverReportHistory"),
  driverReportForm: document.querySelector("#driverReportForm"),
  reportTrip: document.querySelector("#reportTrip"),
  adminView: document.querySelector("#adminView"),
  adminDashboard: document.querySelector("#adminDashboard"),
  adminWorkers: document.querySelector("#adminWorkers"),
  adminWorkerList: document.querySelector("#adminWorkerList"),
  workerForm: document.querySelector("#workerForm"),
  workerSearch: document.querySelector("#workerSearch"),
  adminTrucks: document.querySelector("#adminTrucks"),
  adminTruckList: document.querySelector("#adminTruckList"),
  truckSummary: document.querySelector("#truckSummary"),
  truckForm: document.querySelector("#truckForm"),
  truckDriver: document.querySelector("#truckDriver"),
  adminTrips: document.querySelector("#adminTrips"),
  adminTripList: document.querySelector("#adminTripList"),
  tripForm: document.querySelector("#tripForm"),
  tripDriver: document.querySelector("#tripDriver"),
  tripTruck: document.querySelector("#tripTruck"),
  adminReports: document.querySelector("#adminReports"),
  adminProducts: document.querySelector("#adminProducts"),
  adminProductList: document.querySelector("#adminProductList"),
  adminInvoices: document.querySelector("#adminInvoices"),
  productForm: document.querySelector("#productForm"),
  cancelEdit: document.querySelector("#cancelEdit"),
  toast: document.querySelector("#toast"),
  themeToggle: document.querySelector("#themeToggle")
};

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function money(value) {
  return `Q${Number(value || 0).toFixed(2)}`;
}

function dateOnly(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function promotionText(product) {
  const promotion = product.promotion || { type: "none" };
  if (!promotion.type || promotion.type === "none") return "Sin promoción";
  if (promotion.label) return promotion.label;
  if (promotion.type === "2x1") return "2x1";
  if (promotion.type === "discount5") return "5% descuento";
  if (promotion.type === "discount10") return "10% descuento";
  return `10% ${dayNames[promotion.dayOfWeek] || "día especial"}`;
}

function notify(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function showAuthAlert(message) {
  els.authAlert.textContent = message;
  els.authAlert.classList.remove("hidden");
}

function clearAuthAlert() {
  els.authAlert.textContent = "";
  els.authAlert.classList.add("hidden");
}

function reportConditionFor(type) {
  return type === "Falla mecánica" ? "En reparación" : "Óptimas condiciones";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.blob();

  if (!response.ok) {
    throw new Error(data.message || "Ocurrió un error");
  }

  return data;
}

function setSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem("pina_token", payload.token);
  localStorage.setItem("pina_user", JSON.stringify(payload.user));
  renderNav();
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("pina_token");
  localStorage.removeItem("pina_user");
  navigate("store");
  renderNav();
  notify("Sesión cerrada");
}

function requireLogin() {
  if (state.user) return true;
  openAuth("login");
  notify("Inicia sesión para continuar");
  return false;
}

function renderNav() {
  document.querySelectorAll("[data-auth]").forEach((item) => item.classList.toggle("hidden", !state.user));
  document.querySelectorAll("[data-admin]").forEach((item) => item.classList.toggle("hidden", state.user?.role !== "admin"));
  document.querySelectorAll("[data-driver]").forEach((item) => item.classList.toggle("hidden", state.user?.role !== "driver"));
  document.querySelectorAll("[data-client-only]").forEach((item) => {
    item.classList.toggle("hidden", !state.user || state.user.role === "driver");
  });
  els.authButton.textContent = state.user ? "Salir" : "Ingresar";
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === state.route);
  });
}

function openAuth(mode = "login") {
  state.authMode = mode;
  els.authTitle.textContent = mode === "login" ? "Ingresar" : "Crear cuenta";
  els.authName.classList.toggle("hidden", mode === "login");
  els.authName.required = mode === "register";
  els.switchAuth.textContent = mode === "login" ? "Crear una cuenta" : "Ya tengo cuenta";
  clearAuthAlert();
  els.authDialog.showModal();
}

function showSection(route) {
  const isStore = route === "store";
  els.hero.classList.toggle("hidden", !isStore);
  els.storeToolbar.classList.toggle("hidden", !isStore);
  els.productGrid.classList.toggle("hidden", !isStore);
  els.cartView.classList.toggle("hidden", route !== "cart");
  els.historyView.classList.toggle("hidden", route !== "history");
  els.driverView.classList.toggle("hidden", route !== "driver");
  els.adminView.classList.toggle("hidden", route !== "admin");
}

async function navigate(route) {
  if (["cart", "history", "driver", "admin"].includes(route) && !requireLogin()) return;
  if (route === "admin" && state.user?.role !== "admin") return notify("Solo el administrador puede entrar al panel");
  if (route === "driver" && state.user?.role !== "driver") return notify("Solo los choferes pueden entrar a este panel");

  state.route = route;
  location.hash = route;
  showSection(route);
  renderNav();

  if (route === "store") await loadProducts();
  if (route === "cart") await loadCart();
  if (route === "history") await loadHistory();
  if (route === "driver") await loadDriver();
  if (route === "admin") await loadAdmin();
}

async function loadProducts() {
  const params = new URLSearchParams({
    search: els.searchInput.value.trim(),
    category: els.categoryFilter.value,
    promotion: els.promotionFilter.value
  });
  state.products = await api(`/api/products?${params}`);
  renderProducts();
}

async function loadCategories() {
  state.categories = await api("/api/products/categories");
  els.categoryFilter.innerHTML = `<option value="">Todas las categorías</option>`;
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  });
}

function renderProducts() {
  if (state.products.length === 0) {
    els.productGrid.innerHTML = `<div class="invoice-box">No hay productos disponibles.</div>`;
    return;
  }

  els.productGrid.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div class="product-top">
              <h3>${product.name}</h3>
              <span class="badge">${product.category}</span>
            </div>
            <p class="muted">${product.description}</p>
            <div class="product-top">
              <span class="price">${money(product.price)}</span>
            </div>
            <p><span class="badge">${promotionText(product)}</span></p>
            <button class="btn" type="button" data-add="${product._id}" ${product.stock < 1 || state.user?.role === "driver" ? "disabled" : ""}>Agregar</button>
          </div>
        </article>
      `
    )
    .join("");
}

async function addToCart(productId) {
  if (!requireLogin()) return;
  if (state.user.role === "driver") return notify("La cuenta de chofer no compra productos");
  await api("/api/cart/items", { method: "POST", body: JSON.stringify({ productId, quantity: 1 }) });
  notify("Producto agregado al carrito");
}

async function loadCart() {
  const cart = await api("/api/cart");
  els.cartSubtotal.textContent = `Subtotal: ${money(cart.subtotal)}`;
  els.cartDiscount.textContent = `Descuento: ${money(cart.discount)}`;
  els.cartTotal.textContent = `Total: ${money(cart.total)}`;
  els.checkoutButton.classList.toggle("hidden", cart.items.length === 0);

  if (cart.items.length === 0) {
    els.cartItems.innerHTML = `<div class="invoice-box">Tu carrito está vacío.</div>`;
    return;
  }

  els.cartItems.innerHTML = cart.items
    .map(
      (item) => `
        <div class="line-item">
          <div>
            <h3>${item.product.name}</h3>
            <span class="muted">${money(item.product.price)} unidad | ${item.promotionApplied || "Sin promoción"}</span>
          </div>
          <div class="line-actions">
            <input class="qty" type="number" min="1" max="${item.product.stock}" value="${item.quantity}" data-qty="${item.product._id}" />
            <strong>${money(item.finalSubtotal)}</strong>
            <button class="btn danger small" type="button" data-remove="${item.product._id}">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function loadHistory() {
  const invoices = await api("/api/invoices/mine");
  els.invoiceHistory.innerHTML =
    invoices
      .map(
        (invoice) => `
          <div class="invoice-box">
            <div class="product-top">
              <div>
                <h3>${invoice.invoiceNumber}</h3>
                <span class="muted">${new Date(invoice.createdAt).toLocaleString("es-GT")}</span>
              </div>
              <strong>${money(invoice.total)}</strong>
            </div>
            <p class="muted">${invoice.items.map((item) => `${item.quantity}x ${item.name} ${item.promotionApplied ? `(${item.promotionApplied})` : ""}`).join(", ")}</p>
          <button class="btn small" type="button" data-download-invoice="${invoice._id}">Descargar PDF</button>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">Aún no tienes compras registradas.</div>`;
}

async function checkout() {
  const invoice = await api("/api/invoices/checkout", { method: "POST" });
  notify(`Factura ${invoice.invoiceNumber} generada`);
  await loadCart();
  await loadProducts();
  await downloadInvoice(invoice._id);
}

async function loadAdmin() {
  await Promise.all([loadWorkers(), loadTrucks(), loadTrips(), loadAdminDashboard(), loadAdminProducts(), loadAdminInvoices(), loadReports()]);
  hydrateSelects();
}

async function loadAdminDashboard() {
  const data = await api("/api/admin/dashboard");
  els.adminDashboard.innerHTML = `
    <div class="metric-grid">
      <div class="metric"><span>Productos</span><strong>${data.totalProducts}</strong></div>
      <div class="metric"><span>Usuarios</span><strong>${data.totalUsers}</strong></div>
      <div class="metric"><span>Choferes</span><strong>${data.totalWorkers}</strong></div>
      <div class="metric"><span>Viajes activos</span><strong>${data.activeTrips}</strong></div>
      <div class="metric"><span>Reportes nuevos</span><strong>${data.openReports}</strong></div>
      <div class="metric"><span>Ventas</span><strong>${money(data.totalSales)}</strong></div>
    </div>
    <h3>Facturas recientes</h3>
    <div class="stack">
      ${data.recentInvoices
        .map((invoice) => `<div class="line-item"><div><strong>${invoice.invoiceNumber}</strong><div class="muted">${invoice.customerName}</div></div><span>${money(invoice.total)}</span></div>`)
        .join("") || `<div class="invoice-box">Sin facturas todavía.</div>`}
    </div>
  `;
}

async function loadWorkers() {
  const search = els.workerSearch.value.trim();
  state.workers = await api(`/api/admin/workers?search=${encodeURIComponent(search)}`);
  els.adminWorkerList.innerHTML =
    state.workers
      .map(
        (worker) => `
          <div class="line-item">
            <div>
              <h3>${worker.name}</h3>
              <span class="muted">${worker.phone} | ${worker.profession} | ${worker.laborStatus}</span>
              <div class="muted">${worker.address} | Banco: ${worker.bankAccount} | Usuario: ${worker.user?.email || ""}</div>
              <div class="muted">Contraseña encriptada: ${(worker.user?.password || "No visible").slice(0, 28)}...</div>
            </div>
            <div class="line-actions">
              <button class="btn small ghost" type="button" data-worker-edit="${worker._id}">Editar</button>
              <button class="btn small danger" type="button" data-worker-delete="${worker._id}">Eliminar</button>
            </div>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">No hay trabajadores registrados.</div>`;
}

async function loadTrucks() {
  const data = await api("/api/admin/trucks");
  state.trucks = data.trucks;
  els.truckSummary.innerHTML = `
    <div class="metric"><span>Total</span><strong>${data.summary.total}</strong></div>
    <div class="metric"><span>Disponibles</span><strong>${data.summary.available}</strong></div>
    <div class="metric"><span>Óptimos</span><strong>${data.summary.optimal}</strong></div>
    <div class="metric"><span>Reparación</span><strong>${data.summary.repair}</strong></div>
    <div class="metric"><span>Mantenimiento</span><strong>${data.summary.maintenance}</strong></div>
  `;
  els.adminTruckList.innerHTML =
    state.trucks
      .map(
        (truck) => `
          <div class="line-item">
            <div>
              <h3>${truck.name} (${truck.plate})</h3>
              <span class="muted">${truck.condition} | ${truck.availability} | Chofer: ${truck.driver?.name || "Sin asignar"}</span>
            </div>
            <div class="line-actions">
              <button class="btn small ghost" type="button" data-truck-edit="${truck._id}">Editar</button>
              <button class="btn small danger" type="button" data-truck-delete="${truck._id}">Eliminar</button>
            </div>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">No hay camiones registrados.</div>`;
}

async function loadTrips() {
  state.trips = await api("/api/admin/trips");
  els.adminTripList.innerHTML =
    state.trips
      .map(
        (trip) => `
          <div class="line-item">
            <div>
              <h3>${trip.driver?.name || "Chofer"} hacia ${trip.destinationPlace} (${trip.destination})</h3>
              <span class="muted">${trip.fruitType} | Cantidad: ${trip.quantity}</span>
              <div class="muted">Camión: ${trip.truck?.name || ""} | Sale: ${dateOnly(trip.departureDate)} | Regresa: ${dateOnly(trip.estimatedReturnDate)}</div>
            </div>
            <div class="line-actions">
              <button class="btn small ghost" type="button" data-trip-edit="${trip._id}">Editar</button>
              <button class="btn small" type="button" data-trip-notify="${trip._id}">Notificar</button>
            </div>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">No hay viajes programados.</div>`;
}

async function loadReports() {
  const reports = await api("/api/admin/reports");
  els.adminReports.innerHTML = `
    <h2>Reportes de viaje</h2>
    <div class="stack">
      ${reports
        .map(
          (report) => `
            <div class="invoice-box">
              <div class="product-top">
                <div>
                  <h3>${report.type} | ${report.status}</h3>
                  <span class="muted">${report.driver?.name || ""} | ${report.truck?.name || ""} | ${new Date(report.createdAt).toLocaleString("es-GT")}</span>
                </div>
                <span class="badge">${report.truckConditionUpdate}</span>
              </div>
              <p>${report.message}</p>
              <button class="btn small ghost" type="button" data-report-review="${report._id}">Marcar revisado</button>
            </div>
          `
        )
        .join("") || `<div class="invoice-box">Sin reportes de choferes.</div>`}
    </div>
  `;
}

async function loadAdminProducts() {
  const products = await api("/api/products");
  els.adminProductList.innerHTML = `
    <h3>Con promoción</h3>
    <div class="stack">${renderAdminProducts(products.filter((product) => product.promotion?.type && product.promotion.type !== "none")) || `<div class="invoice-box">Sin promociones activas.</div>`}</div>
    <h3>Sin promoción</h3>
    <div class="stack">${renderAdminProducts(products.filter((product) => !product.promotion?.type || product.promotion.type === "none")) || `<div class="invoice-box">Sin productos en esta sección.</div>`}</div>
  `;
}

function renderAdminProducts(products) {
  return products
    .map(
      (product) => `
        <div class="line-item">
          <div>
            <h3>${product.name}</h3>
            <span class="muted">${product.category} | Stock: ${product.stock} | ${money(product.price)} | ${promotionText(product)}</span>
          </div>
          <div class="line-actions">
            <button class="btn small ghost" type="button" data-edit="${product._id}">Editar</button>
            <button class="btn small danger" type="button" data-delete="${product._id}">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function loadAdminInvoices() {
  const invoices = await api("/api/admin/invoices");
  els.adminInvoices.innerHTML = `
    <h2>Facturas generadas</h2>
    <div class="stack">
      ${invoices
        .map(
          (invoice) => `
            <div class="invoice-box">
              <div class="product-top">
                <div>
                  <h3>${invoice.invoiceNumber}</h3>
                  <span class="muted">${invoice.customerName} | ${new Date(invoice.createdAt).toLocaleString("es-GT")}</span>
                </div>
                <strong>${money(invoice.total)}</strong>
              </div>
              <p class="muted">${invoice.items.map((item) => `${item.quantity}x ${item.name} ${item.promotionApplied ? `(${item.promotionApplied})` : ""}`).join(", ")}</p>
            </div>
          `
        )
        .join("") || `<div class="invoice-box">No hay facturas generadas.</div>`}
    </div>
  `;
}

function hydrateSelects() {
  const workerOptions = `<option value="">Sin asignar</option>${state.workers.map((worker) => `<option value="${worker._id}">${worker.name}</option>`).join("")}`;
  els.truckDriver.innerHTML = workerOptions;
  els.tripDriver.innerHTML = state.workers.map((worker) => `<option value="${worker._id}">${worker.name}</option>`).join("");
  els.tripTruck.innerHTML = state.trucks.map((truck) => `<option value="${truck._id}">${truck.name} (${truck.plate})</option>`).join("");
}

async function loadDriver() {
  const [trips, reports] = await Promise.all([api("/api/driver/trips"), api("/api/driver/reports")]);
  state.driverTrips = trips;
  els.driverTrips.innerHTML =
    state.driverTrips
      .map(
        (trip) => `
          <div class="line-item">
            <div>
              <h3>${trip.destinationPlace} (${trip.destination})</h3>
              <span class="muted">${trip.fruitType} | Camión: ${trip.truck?.name || ""}</span>
              <div class="muted">Salida: ${dateOnly(trip.departureDate)} | Regreso: ${dateOnly(trip.estimatedReturnDate)}</div>
            </div>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">No tienes viajes asignados.</div>`;
  els.reportTrip.innerHTML = state.driverTrips
    .map((trip) => `<option value="${trip._id}">${trip.destinationPlace} | ${trip.fruitType}</option>`)
    .join("");
  els.driverReportHistory.innerHTML =
    reports
      .map(
        (report) => `
          <div class="invoice-box">
            <div class="product-top">
              <div>
                <h3>${report.type}</h3>
                <span class="muted">${report.trip?.destinationPlace || ""} | ${new Date(report.createdAt).toLocaleString("es-GT")}</span>
              </div>
              <span class="badge">${report.status === "Revisado" ? "Administrador enterado" : "Pendiente de revisión"}</span>
            </div>
            <p>${report.message}</p>
          </div>
        `
      )
      .join("") || `<div class="invoice-box">Aún no has enviado reportes.</div>`;
}

function fillProductForm(product = {}) {
  document.querySelector("#productId").value = product._id || "";
  document.querySelector("#productName").value = product.name || "";
  document.querySelector("#productCategory").value = product.category || "";
  document.querySelector("#productPrice").value = product.price || "";
  document.querySelector("#productStock").value = product.stock || "";
  document.querySelector("#productImage").value = product.image || "";
  document.querySelector("#productDescription").value = product.description || "";
  document.querySelector("#productFeatured").checked = Boolean(product.featured);
  document.querySelector("#productPromotion").value = product.promotion?.type || "none";
  document.querySelector("#productPromoDay").value = product.promotion?.dayOfWeek ?? "";
  document.querySelector("#productPromoLabel").value = product.promotion?.label || "";
}

function getProductFormData() {
  const promoType = document.querySelector("#productPromotion").value;
  return {
    name: document.querySelector("#productName").value.trim(),
    category: document.querySelector("#productCategory").value.trim(),
    price: Number(document.querySelector("#productPrice").value),
    stock: Number(document.querySelector("#productStock").value),
    image: document.querySelector("#productImage").value.trim(),
    description: document.querySelector("#productDescription").value.trim(),
    featured: document.querySelector("#productFeatured").checked,
    promotion: {
      type: promoType,
      dayOfWeek: document.querySelector("#productPromoDay").value ? Number(document.querySelector("#productPromoDay").value) : undefined,
      label: document.querySelector("#productPromoLabel").value.trim()
    }
  };
}

function fillWorkerForm(worker = {}) {
  document.querySelector("#workerId").value = worker._id || "";
  document.querySelector("#workerName").value = worker.name || "";
  document.querySelector("#workerEmail").value = worker.user?.email || "";
  document.querySelector("#workerPassword").value = "";
  document.querySelector("#workerPhone").value = worker.phone || "";
  document.querySelector("#workerAddress").value = worker.address || "";
  document.querySelector("#workerBank").value = worker.bankAccount || "";
  document.querySelector("#workerProfession").value = worker.profession || "Chofer";
  document.querySelector("#workerStatus").value = worker.laborStatus || "Disponible";
}

function fillTruckForm(truck = {}) {
  document.querySelector("#truckId").value = truck._id || "";
  document.querySelector("#truckName").value = truck.name || "";
  document.querySelector("#truckPlate").value = truck.plate || "";
  document.querySelector("#truckDriver").value = truck.driver?._id || truck.driver || "";
  document.querySelector("#truckCondition").value = truck.condition || "Óptimas condiciones";
  document.querySelector("#truckAvailability").value = truck.availability || "Disponible";
}

function fillTripForm(trip = {}) {
  document.querySelector("#tripId").value = trip._id || "";
  document.querySelector("#tripDriver").value = trip.driver?._id || trip.driver || "";
  document.querySelector("#tripTruck").value = trip.truck?._id || trip.truck || "";
  document.querySelector("#tripDestination").value = trip.destination || "Potra";
  document.querySelector("#tripFruit").value = trip.fruitType || "Piña";
  document.querySelector("#tripQuantity").value = trip.quantity || "";
  document.querySelector("#tripDeparture").value = dateOnly(trip.departureDate);
  document.querySelector("#tripReturn").value = dateOnly(trip.estimatedReturnDate);
}

async function saveProduct(event) {
  event.preventDefault();
  const id = document.querySelector("#productId").value;
  const method = id ? "PUT" : "POST";
  await api(id ? `/api/products/${id}` : "/api/products", { method, body: JSON.stringify(getProductFormData()) });
  fillProductForm();
  await Promise.all([loadAdminProducts(), loadProducts(), loadCategories()]);
  notify("Producto guardado");
}

async function saveWorker(event) {
  event.preventDefault();
  const id = document.querySelector("#workerId").value;
  const payload = {
    name: document.querySelector("#workerName").value.trim(),
    email: document.querySelector("#workerEmail").value.trim(),
    password: document.querySelector("#workerPassword").value,
    phone: document.querySelector("#workerPhone").value.trim(),
    address: document.querySelector("#workerAddress").value.trim(),
    bankAccount: document.querySelector("#workerBank").value.trim(),
    profession: document.querySelector("#workerProfession").value.trim(),
    laborStatus: document.querySelector("#workerStatus").value
  };
  if (!id && !payload.password) return notify("La contraseña inicial es obligatoria");
  if (!payload.password) delete payload.password;
  await api(id ? `/api/admin/workers/${id}` : "/api/admin/workers", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  fillWorkerForm();
  await loadWorkers();
  hydrateSelects();
  notify("Trabajador guardado");
}

async function saveTruck(event) {
  event.preventDefault();
  const id = document.querySelector("#truckId").value;
  const payload = {
    name: document.querySelector("#truckName").value.trim(),
    plate: document.querySelector("#truckPlate").value.trim(),
    driver: document.querySelector("#truckDriver").value || undefined,
    condition: document.querySelector("#truckCondition").value,
    availability: document.querySelector("#truckAvailability").value
  };
  await api(id ? `/api/admin/trucks/${id}` : "/api/admin/trucks", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  fillTruckForm();
  await loadTrucks();
  hydrateSelects();
  notify("Camión guardado");
}

async function saveTrip(event) {
  event.preventDefault();
  const destinationSelect = document.querySelector("#tripDestination");
  const selected = destinationSelect.options[destinationSelect.selectedIndex];
  const id = document.querySelector("#tripId").value;
  const payload = {
    driver: document.querySelector("#tripDriver").value,
    truck: document.querySelector("#tripTruck").value,
    destination: destinationSelect.value,
    destinationPlace: selected.dataset.place,
    fruitType: document.querySelector("#tripFruit").value,
    quantity: Number(document.querySelector("#tripQuantity").value),
    departureDate: document.querySelector("#tripDeparture").value,
    estimatedReturnDate: document.querySelector("#tripReturn").value
  };
  await api(id ? `/api/admin/trips/${id}` : "/api/admin/trips", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  });
  fillTripForm();
  await Promise.all([loadTrips(), loadTrucks(), loadWorkers()]);
  hydrateSelects();
  notify("Viaje guardado");
}

function bindEvents() {
  els.menuButton.addEventListener("click", () => els.navLinks.classList.toggle("open"));
  els.authButton.addEventListener("click", () => (state.user ? logout() : openAuth("login")));
  els.closeAuth.addEventListener("click", () => els.authDialog.close());
  els.switchAuth.addEventListener("click", () => openAuth(state.authMode === "login" ? "register" : "login"));
  els.themeToggle.addEventListener("click", () => document.body.classList.toggle("dark"));
  els.searchInput.addEventListener("input", () => loadProducts().catch((error) => notify(error.message)));
  els.categoryFilter.addEventListener("change", () => loadProducts().catch((error) => notify(error.message)));
  els.promotionFilter.addEventListener("change", () => loadProducts().catch((error) => notify(error.message)));
  els.checkoutButton.addEventListener("click", () => checkout().catch((error) => notify(error.message)));
  els.productForm.addEventListener("submit", (event) => saveProduct(event).catch((error) => notify(error.message)));
  document.querySelector("#productImageFile").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.querySelector("#productImage").value = reader.result;
    };
    reader.readAsDataURL(file);
  });
  els.workerForm.addEventListener("submit", (event) => saveWorker(event).catch((error) => notify(error.message)));
  els.truckForm.addEventListener("submit", (event) => saveTruck(event).catch((error) => notify(error.message)));
  els.tripForm.addEventListener("submit", (event) => saveTrip(event).catch((error) => notify(error.message)));
  els.workerSearch.addEventListener("input", () => loadWorkers().catch((error) => notify(error.message)));
  els.cancelEdit.addEventListener("click", () => fillProductForm());
  document.querySelector("#clearWorker").addEventListener("click", () => fillWorkerForm());
  document.querySelector("#clearTruck").addEventListener("click", () => fillTruckForm());
  document.querySelector("#clearTrip").addEventListener("click", () => fillTripForm());

  els.driverReportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reportType = document.querySelector("#reportType").value;
    await api("/api/driver/reports", {
      method: "POST",
      body: JSON.stringify({
        trip: document.querySelector("#reportTrip").value,
        type: reportType,
        truckConditionUpdate: reportConditionFor(reportType),
        message: document.querySelector("#reportMessage").value.trim()
      })
    });
    els.driverReportForm.reset();
    notify("Reporte enviado al administrador");
  });

  document.addEventListener("click", async (event) => {
    const route = event.target.closest("[data-route]")?.dataset.route;
    if (route) {
      event.preventDefault();
      els.navLinks.classList.remove("open");
      navigate(route).catch((error) => notify(error.message));
    }

    const addId = event.target.dataset.add;
    if (addId) addToCart(addId).catch((error) => notify(error.message));

    const removeId = event.target.dataset.remove;
    if (removeId) {
      await api(`/api/cart/items/${removeId}`, { method: "DELETE" });
      await loadCart();
    }

    const editId = event.target.dataset.edit;
    if (editId) fillProductForm(await api(`/api/products/${editId}`));

    const deleteId = event.target.dataset.delete;
    if (deleteId && confirm("¿Eliminar este producto?")) {
      await api(`/api/products/${deleteId}`, { method: "DELETE" });
      await Promise.all([loadAdminProducts(), loadProducts(), loadCategories()]);
      notify("Producto eliminado");
    }

    const workerEdit = event.target.dataset.workerEdit;
    if (workerEdit) fillWorkerForm(state.workers.find((worker) => worker._id === workerEdit));

    const workerDelete = event.target.dataset.workerDelete;
    if (workerDelete && confirm("¿Eliminar este trabajador y su usuario?")) {
      await api(`/api/admin/workers/${workerDelete}`, { method: "DELETE" });
      await loadWorkers();
      hydrateSelects();
      notify("Trabajador eliminado");
    }

    const truckEdit = event.target.dataset.truckEdit;
    if (truckEdit) fillTruckForm(state.trucks.find((truck) => truck._id === truckEdit));

    const truckDelete = event.target.dataset.truckDelete;
    if (truckDelete && confirm("¿Eliminar este camión?")) {
      await api(`/api/admin/trucks/${truckDelete}`, { method: "DELETE" });
      await loadTrucks();
      hydrateSelects();
      notify("Camión eliminado");
    }

    const tripEdit = event.target.dataset.tripEdit;
    if (tripEdit) fillTripForm(state.trips.find((trip) => trip._id === tripEdit));

    const tripNotify = event.target.dataset.tripNotify;
    if (tripNotify) {
      const message = prompt("Mensaje para el chofer responsable:");
      if (message) {
        await api(`/api/admin/trips/${tripNotify}/notify`, { method: "POST", body: JSON.stringify({ message }) });
        notify("Notificación enviada");
      }
    }

    const reportReview = event.target.dataset.reportReview;
    if (reportReview) {
      await api(`/api/admin/reports/${reportReview}/review`, { method: "PATCH" });
      await loadReports();
      notify("Reporte marcado como revisado");
    }

    const invoiceId = event.target.dataset.downloadInvoice;
    if (invoiceId) {
      await downloadInvoice(invoiceId);
    }
  });

  document.querySelector("#reportType").addEventListener("change", (event) => {
    document.querySelector("#reportTruckCondition").value = reportConditionFor(event.target.value);
  });

  document.addEventListener("change", async (event) => {
    const productId = event.target.dataset.qty;
    if (!productId) return;
    await api(`/api/cart/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: Number(event.target.value) })
    });
    await loadCart();
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-admin-tab]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      const tab = button.dataset.adminTab;
      ["Dashboard", "Workers", "Trucks", "Trips", "Reports", "Products", "Invoices"].forEach((name) => {
        document.querySelector(`#admin${name}`).classList.toggle("hidden", tab.toLowerCase() !== name.toLowerCase());
      });
    });
  });

  document.querySelectorAll("[data-driver-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-driver-tab]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      els.driverTrips.classList.toggle("hidden", button.dataset.driverTab !== "driverTrips");
      els.driverReports.classList.toggle("hidden", button.dataset.driverTab !== "driverReports");
      els.driverReportHistory.classList.toggle("hidden", button.dataset.driverTab !== "driverReportHistory");
    });
  });

  els.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      clearAuthAlert();
      const payload = { email: els.authEmail.value.trim(), password: els.authPassword.value };
      if (state.authMode === "register") payload.name = els.authName.value.trim();
      const result = await api(`/api/auth/${state.authMode}`, { method: "POST", body: JSON.stringify(payload) });
      setSession(result);
      els.authDialog.close();
      els.authForm.reset();
      notify(`Bienvenido, ${result.user.name}`);
      if (result.user.role === "driver") navigate("driver");
    } catch (error) {
      showAuthAlert(error.message);
      notify(error.message);
    }
  });
}

async function downloadInvoice(invoiceId) {
  const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
    headers: { Authorization: `Bearer ${state.token}` }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "No se pudo descargar la factura" }));
    notify(error.message);
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `factura-${invoiceId}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify("Factura PDF descargada");
}

async function init() {
  bindEvents();
  renderNav();
  showSection("store");
  await loadCategories();
  await navigate(location.hash.replace("#", "") || "store");
}

init().catch((error) => notify(error.message));
