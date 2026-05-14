# 🍛 Sravya Garden — Food Ordering App

A full-stack food ordering web application built with **HTML, CSS, JavaScript, Node.js, Express, and SQLite**.

🌐 **Live Demo:** [sravya-garden-production.up.railway.app](https://sravya-garden-production.up.railway.app)

---


---

## ✨ Features

- 🍗 **Full Menu** — Non-Veg, Veg, Noodles, Fried Rice, Soups, Drinks
- 🛒 **Cart System** — Add, remove, increase/decrease quantity
- ✅ **Place Orders** — Saved to SQLite database
- 🚴 **Order Tracking** — Live status with 40-minute delivery countdown
- 📋 **Admin Panel** — View all orders, update status in real time
- 🔄 **Auto Refresh** — Orders page updates every 5 seconds automatically
- 🟢 **Backend Status** — Live connection indicator
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (local) / Memory (cloud) |
| Deployment | Railway |
| Version Control | GitHub |

---

## 📁 Project Structure

```
sravya-garden/
├── server.js           ← Express backend API
├── package.json        ← Dependencies
├── .gitignore
└── public/             ← Frontend files
    ├── index.html      ← Main menu page
    ├── order.html      ← Admin orders panel
    ├── track.html      ← Order tracking page
    ├── script.js       ← Cart & order logic
    ├── order.js        ← Orders panel logic
    └── images/         ← Food images
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/order` | Place a new order |
| GET | `/orders` | Get all orders |
| GET | `/track/:id` | Track single order |
| PUT | `/update-status/:id` | Update order status |

---

## ⚡ Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/sravya233/sravya-garden.git
cd sravya-garden
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
node server.js
```

### 4. Open in browser
```
http://localhost:5000
```

---

## 🚀 Deploy to Railway

1. Fork this repository
2. Go to [railway.app](https://railway.app)
3. Click **New Project** → **Deploy from GitHub**
4. Select this repository
5. Railway auto-detects Node.js and deploys ✅

---

## 📋 Pages

| Page | URL | Description |
|---|---|---|
| Menu | `/` | Browse and order food |
| Track Order | `/track.html` | Track delivery with countdown |
| Admin Panel | `/order.html` | Manage all orders |

---

## 🍽️ Menu Categories

- 🍗 **Non-Veg** — Chicken Biryani, Fish Curry, Prawns, Mutton and more
- 🥗 **Veg** — Veg Biryani, Paneer Biryani, Palak Paneer and more
- 🍜 **Noodles** — Chicken, Veg, Egg, Mixed, Prawns
- 🍚 **Fried Rice** — Chicken, Veg, Mixed, Paneer, Prawns
- 🥣 **Soups** — Chicken, Mutton, Sweet Corn, Lemon Coriander
- 🥤 **Drinks** — Thums Up, Sprite, Frooti, Coca Cola

---

## 👩‍💻 Developer

**Sravya** — Built with ❤️ in Vijayawada, Andhra Pradesh 🇮🇳

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
