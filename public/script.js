/* ═══════════════════════════════════════════════
   SRAVYA GARDEN — script.js
   ═══════════════════════════════════════════════ */

/* Auto-detects local vs deployed */
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '';

let cart = [];

/* ── ADD TO CART ────────────────────────────────── */
function addToCart(name, price) {

  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  updateCart();

  // Flash the button green
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.getAttribute("onclick") &&
        btn.getAttribute("onclick").includes(name.replace(/'/g, "\\'"))) {
      btn.innerText = "✔ Added!";
      btn.style.background = "#16a34a";
      setTimeout(() => {
        btn.innerText = "Add";
        btn.style.background = "#250790";
      }, 800);
    }
  });

}

/* ── UPDATE CART BAR ────────────────────────────── */
function updateCart() {

  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    count += item.qty;
  });

  document.getElementById("total").innerText = total;
  document.getElementById("count").innerText = count + " item" + (count !== 1 ? "s" : "");

  const cartBar = document.getElementById("cartBar");
  cartBar.style.display = cart.length > 0 ? "flex" : "none";

}

/* ── OPEN CART ──────────────────────────────────── */
function openCart() {

  let html  = "";
  let total = 0;

  if (cart.length === 0) {

    html = `<p style="text-align:center;color:#aaa;padding:20px;">
              Your cart is empty 🛒
            </p>`;

  } else {

    cart.forEach((item, index) => {

      total += item.price * item.qty;

      html += `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:14px;
          border-bottom:1px solid #eee;
          padding-bottom:12px;
        ">
          <div>
            <h4 style="margin:0;font-size:15px;">${item.name}</h4>
            <p style="margin:4px 0;color:#c02b7d;font-weight:700;">
              ₹${item.price} × ${item.qty} = ₹${item.price * item.qty}
            </p>
          </div>
          <div style="display:flex;gap:6px;">
            <button onclick="decreaseQty(${index})" style="background:#999;padding:5px 10px;border-radius:6px;">−</button>
            <button onclick="increaseQty(${index})" style="background:#16a34a;padding:5px 10px;border-radius:6px;">+</button>
            <button onclick="removeItem(${index})"  style="background:#dc2626;padding:5px 10px;border-radius:6px;">✕</button>
          </div>
        </div>
      `;

    });

  }

  document.getElementById("items").innerHTML     = html;
  document.getElementById("finalTotal").innerText = total;
  document.getElementById("cartModal").style.display = "block";

}

/* ── CLOSE CART ─────────────────────────────────── */
function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

/* ── INCREASE QTY ───────────────────────────────── */
function increaseQty(index) {
  cart[index].qty++;
  updateCart();
  openCart();
}

/* ── DECREASE QTY ───────────────────────────────── */
function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }
  updateCart();
  openCart();
}

/* ── REMOVE ITEM ────────────────────────────────── */
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
  openCart();
}

/* ── PAY / PLACE ORDER ──────────────────────────── */
async function pay() {

  if (cart.length === 0) {
    alert("🛒 Your cart is empty!");
    return;
  }

  let total = 0;
  cart.forEach(item => total += item.price * item.qty);

  const payBtn     = document.getElementById("payBtn");
  payBtn.innerText = "Processing...";
  payBtn.disabled  = true;

  try {

    const res = await fetch(`${API}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, total })
    });

    const data = await res.json();

    if (data.success) {
      closeCart();
      showSuccess(data.orderId, total);
      cart = [];
      updateCart();
    } else {
      alert("❌ " + (data.message || "Order failed"));
    }

  } catch (err) {
    alert("❌ Backend not running!\nOpen CMD and run: node server.js");
  }

  payBtn.innerText = "Pay Now";
  payBtn.disabled  = false;

}

/* ── SUCCESS POPUP ──────────────────────────────── */
function showSuccess(orderId, total) {

  const popup = document.createElement("div");
  popup.style.cssText = `
    position:fixed; inset:0;
    background:rgba(0,0,0,0.6);
    z-index:999;
    display:flex;
    align-items:center;
    justify-content:center;
  `;

  popup.innerHTML = `
    <div style="
      background:white;
      border-radius:20px;
      padding:36px 28px;
      text-align:center;
      max-width:340px;
      width:90%;
      box-shadow:0 20px 60px rgba(0,0,0,0.3);
    ">
      <div style="font-size:52px;">🎉</div>
      <h2 style="color:#16a34a;margin:12px 0 6px;font-family:Nunito,sans-serif;">
        Order Placed!
      </h2>
      <div style="
        background:#f0f4ff;
        border-radius:10px;
        padding:10px 20px;
        font-size:22px;
        font-weight:900;
        color:#250790;
        letter-spacing:3px;
        margin:12px 0;
        font-family:monospace;
      ">
        Order #${orderId}
      </div>
      <p style="color:#555;font-size:14px;margin:6px 0;">
        Total: <strong>₹${total}</strong>
      </p>
      <p style="color:#555;font-size:14px;margin:6px 0;">
        Estimated delivery: 30–40 mins 🚴
      </p>
      <a href="track.html?id=${orderId}" style="
        display:block;
        background:#c02b7d;
        color:white;
        text-decoration:none;
        padding:12px;
        border-radius:10px;
        font-weight:800;
        font-size:15px;
        margin-top:14px;
        font-family:Nunito,sans-serif;
      ">🚴 Track My Order</a>
      <button onclick="this.closest('div').parentElement.remove()" style="
        background:#f0f0f0;
        color:#333;
        border:none;
        width:100%;
        padding:10px;
        border-radius:10px;
        font-size:14px;
        font-weight:700;
        cursor:pointer;
        margin-top:8px;
        font-family:Nunito,sans-serif;
      ">Continue Ordering</button>
    </div>
  `;

  document.body.appendChild(popup);

}

/* ── CHECK BACKEND STATUS ───────────────────────── */
async function checkBackend() {

  const bar = document.getElementById("statusBar");
  if (!bar) return;

  try {
    const res  = await fetch(`${API}/health`);
    const data = await res.json();
    bar.style.background = "#dcfce7";
    bar.style.color      = "#16a34a";
    bar.innerText        = "🟢 Backend connected — " + (data.storage || "ready");
  } catch {
    bar.style.background = "#fee2e2";
    bar.style.color      = "#dc2626";
    bar.innerText        = "🔴 Backend offline — open CMD and run: node server.js";
  }

}

/* ── ON PAGE LOAD ───────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  checkBackend();
});