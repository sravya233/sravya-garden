const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ── SQLite Setup ───────────────────────────────────────── */
let db;
try {
  const Database = require("better-sqlite3");
  db = new Database(path.join(__dirname, "orders.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      items     TEXT    NOT NULL,
      total     REAL    NOT NULL,
      status    TEXT    NOT NULL DEFAULT 'Preparing',
      createdAt TEXT    DEFAULT (datetime('now','localtime'))
    );
  `);

  console.log("✅ SQLite database ready → orders.db");

} catch (err) {
  console.log("⚠️  SQLite not found, using memory storage");
  console.log("   Run: npm install better-sqlite3");
  db = null;
}

/* In-memory fallback */
let memoryOrders = [];

/* ── HOME ───────────────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🍛 Sravya Garden Backend Running",
    storage: db ? "SQLite" : "Memory"
  });
});

/* ── PLACE ORDER ────────────────────────────────────────── */
app.post("/order", (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (db) {
      const result = db.prepare(
        "INSERT INTO orders (items, total, status) VALUES (?, ?, ?)"
      ).run(JSON.stringify(items), total, "Preparing");

      console.log(`✅ Order #${result.lastInsertRowid} — ₹${total}`);
      res.json({
        success: true,
        message: `Order Placed! Order #${result.lastInsertRowid}`,
        orderId: result.lastInsertRowid
      });

    } else {
      const order = {
        id: memoryOrders.length + 1,
        items,
        total,
        status: "Preparing",
        createdAt: new Date().toISOString()
      };
      memoryOrders.push(order);

      console.log(`✅ Order #${order.id} (memory) — ₹${total}`);
      res.json({
        success: true,
        message: `Order Placed! Order #${order.id}`,
        orderId: order.id
      });
    }

  } catch (err) {
    console.log("Order error:", err);
    res.status(500).json({ success: false, message: "Server Error: " + err.message });
  }
});

/* ── GET ALL ORDERS ─────────────────────────────────────── */
app.get("/orders", (req, res) => {
  try {
    if (db) {
      const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
      res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
    } else {
      res.json([...memoryOrders].reverse());
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

/* ── TRACK ORDER ────────────────────────────────────────── */
app.get("/track/:id", (req, res) => {
  try {
    if (db) {
      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
      if (!row) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ ...row, items: JSON.parse(row.items) });
    } else {
      const order = memoryOrders.find(o => o.id == req.params.id);
      if (!order) return res.status(404).json({ success: false, message: "Not found" });
      res.json(order);
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ── UPDATE STATUS ──────────────────────────────────────── */
app.put("/update-status/:id", (req, res) => {
  try {
    const { status } = req.body;
    if (db) {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
      res.json({ success: true, order: { ...updated, items: JSON.parse(updated.items) } });
    } else {
      const order = memoryOrders.find(o => o.id == req.params.id);
      if (order) order.status = status;
      res.json({ success: true, order });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ── START ──────────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server → http://localhost:${PORT}`);
  console.log(`   Storage: ${db ? "SQLite (orders.db)" : "Memory"}\n`);
});