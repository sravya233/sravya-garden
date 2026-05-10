/* ═══════════════════════════════════════════════
   SRAVYA GARDEN — order.js
   ═══════════════════════════════════════════════ */

let allOrders = [];
let currentFilter = 'All';

/* ── FETCH ORDERS ─────────────────────────────────── */
async function fetchOrders() {

  document.getElementById("ordersContainer").innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading orders...</p>
    </div>
  `;

  try {

    const res = await fetch("http://localhost:5000/orders");
    allOrders = await res.json();

    updateStats();
    renderOrders(currentFilter);

  } catch(err) {

    document.getElementById("ordersContainer").innerHTML = `
      <div class="empty">
        <p>❌</p>
        <p style="font-size:18px;font-weight:700;color:#dc2626;">Cannot connect to server</p>
        <p style="font-size:14px;margin-top:8px;">Make sure backend is running:<br><strong>node server.js</strong></p>
      </div>
    `;

  }

}

/* ── UPDATE STATS ─────────────────────────────────── */
function updateStats() {

  const total     = allOrders.length;
  const revenue   = allOrders.reduce((s, o) => s + o.total, 0);
  const preparing = allOrders.filter(o => o.status === 'Preparing').length;
  const delivered = allOrders.filter(o => o.status === 'Delivered').length;

  document.getElementById("statTotal").innerText     = total;
  document.getElementById("statRevenue").innerText   = "₹" + revenue.toLocaleString('en-IN');
  document.getElementById("statPreparing").innerText = preparing;
  document.getElementById("statDelivered").innerText = delivered;

}

/* ── FILTER ───────────────────────────────────────── */
function filterOrders(status, btn) {

  currentFilter = status;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  renderOrders(status);

}

/* ── PARSE ITEMS SAFELY ───────────────────────────── */
function parseItems(items) {
  // If items is already an array, return it directly
  if (Array.isArray(items)) return items;

  // If it's a string (e.g. from SQLite), parse it
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return [];
}

/* ── RENDER ORDERS ────────────────────────────────── */
function renderOrders(filter) {

  const filtered = filter === 'All'
    ? allOrders
    : allOrders.filter(o => o.status === filter);

  if (filtered.length === 0) {
    document.getElementById("ordersContainer").innerHTML = `
      <div class="empty">
        <p>🍽️</p>
        <p style="font-size:16px;font-weight:700;">No orders found</p>
      </div>
    `;
    return;
  }

  let html = "";

  filtered.forEach((order) => {

    // Format date — works with SQLite and ISO strings
    let dateStr = "—";
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      dateStr = isNaN(d)
        ? order.createdAt
        : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    }

    // Status CSS class (handle spaces in "Out for Delivery")
    const statusClass = order.status.replace(/\s+/g, '-');

    // ✅ FIXED: safely parse items whether they're a string or array
    const items = parseItems(order.items);

    // Items rows
    let itemsHtml = "";
    if (items.length > 0) {
      items.forEach(item => {
        const qty   = item.qty || item.quantity || 1;
        const price = item.price || 0;
        itemsHtml += `
          <div class="item">
            <span class="item-name">${item.name} × ${qty}</span>
            <span class="item-price">₹${price * qty}</span>
          </div>
        `;
      });
    } else {
      itemsHtml = `<div class="item"><span class="item-name" style="color:#aaa;">No items found</span></div>`;
    }

    html += `
      <div class="card" id="card-${order.id}">

        <div class="card-header">
          <div>
            <div class="order-id">Order #${order.id}</div>
            <div class="date">${dateStr}</div>
          </div>
          <span class="status ${statusClass}">${order.status}</span>
        </div>

        ${itemsHtml}

        <div class="total">
          <span class="total-amount">Total: ₹${order.total}</span>
        </div>

        <div class="status-update">
          <span>Update:</span>
          <select id="sel-${order.id}">
            <option value="Preparing"        ${order.status === 'Preparing'        ? 'selected' : ''}>Preparing</option>
            <option value="Confirmed"        ${order.status === 'Confirmed'        ? 'selected' : ''}>Confirmed</option>
            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered"        ${order.status === 'Delivered'        ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled"        ${order.status === 'Cancelled'        ? 'selected' : ''}>Cancelled</option>
          </select>
          <button class="update-btn" onclick="updateStatus(${order.id})">✔ Update</button>
        </div>

      </div>
    `;

  });

  document.getElementById("ordersContainer").innerHTML = html;

}

/* ── UPDATE STATUS ────────────────────────────────── */
async function updateStatus(id) {

  const status = document.getElementById(`sel-${id}`).value;

  try {

    const res  = await fetch(`http://localhost:5000/update-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (data.success) {
      allOrders = allOrders.map(o => o.id === id ? { ...o, status } : o);
      updateStats();
      renderOrders(currentFilter);
    }

  } catch(err) {
    alert("❌ Could not update status. Is the server running?");
  }

}

/* ── LOAD ON START ────────────────────────────────── */
fetchOrders();

// Auto-refresh every 30 seconds
setInterval(fetchOrders, 30000);