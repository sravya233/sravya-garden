const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* ── SQLite (local) or Memory (Railway) ─────────────── */
let db = null;

try {
  const Database = require("better-sqlite3");
  db = new Database(path.join(__dirname, "orders.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      items     TEXT    NOT NULL,
      total     REAL    NOT NULL,
      status    TEXT    NOT NULL DEFAULT 'Confirmed',
      createdAt TEXT    DEFAULT (datetime('now','localtime'))
    );
  `);
  console.log("✅ SQLite ready → orders.db");
} catch (err) {
  console.log("ℹ️  Running with memory storage (Railway/cloud mode)");
  db = null;
}

/* ── Memory Storage (used on Railway) ───────────────── */
let memoryOrders = [];
let nextId       = 1;

/* ── HEALTH CHECK ────────────────────────────────────── */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🍛 Sravya Garden Running",
    storage: db ? "SQLite" : "Memory"
  });
});

/* ── PLACE ORDER ─────────────────────────────────────── */
app.post("/order", (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    if (db) {
      const result = db.prepare(
        "INSERT INTO orders (items, total, status) VALUES (?, ?, ?)"
      ).run(JSON.stringify(items), total, "Confirmed");
      console.log(`✅ Order #${result.lastInsertRowid} — ₹${total}`);
      return res.json({
        success: true,
        message: `Order Placed! Order #${result.lastInsertRowid}`,
        orderId: result.lastInsertRowid
      });
    }

    // Memory
    const order = {
      id:        nextId++,
      items,
      total,
      status:    "Confirmed",
      createdAt: new Date().toISOString()
    };
    memoryOrders.push(order);
    console.log(`✅ Order #${order.id} (memory) — ₹${total}`);
    res.json({
      success: true,
      message: `Order Placed! Order #${order.id}`,
      orderId: order.id
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET ALL ORDERS ──────────────────────────────────── */
app.get("/orders", (req, res) => {
  try {
    if (db) {
      const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
      return res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
    }
    res.json([...memoryOrders].reverse());
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

/* ── TRACK SINGLE ORDER ──────────────────────────────── */
app.get("/track/:id", (req, res) => {
  try {
    if (db) {
      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
      if (!row) return res.status(404).json({ success: false, message: "Order not found" });
      return res.json({ ...row, items: JSON.parse(row.items) });
    }
    const order = memoryOrders.find(o => o.id == req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ── UPDATE STATUS ───────────────────────────────────── */
app.put("/update-status/:id", (req, res) => {
  try {
    const { status } = req.body;
    if (db) {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
      return res.json({ success: true, order: { ...updated, items: JSON.parse(updated.items) } });
    }
    const order = memoryOrders.find(o => o.id == req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.status = status;
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ── Serve frontend files LAST ───────────────────────── */
app.use(express.static(path.join(__dirname, "public")));

/* ── START SERVER ────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server → http://localhost:${PORT}`);
  console.log(`   Storage: ${db ? "SQLite" : "Memory (cloud mode)"}\n`);
});