# 📦 Predictive Inventory System — Backend

A production-ready Node.js/Express backend for a Predictive Inventory Management System, connected to MongoDB Atlas.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Or start production server
npm start
```

Server runs at: **http://localhost:5000**

---

## 🔑 Environment Variables (.env)

Already configured! Your `.env` contains:
- `MONGO_URI` — MongoDB Atlas cluster
- `JWT_SECRET` — Token signing key
- `JWT_EXPIRE` — Token expiry (7 days)

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register user | No |
| POST | `/login` | Login & get JWT | No |
| GET | `/me` | Get profile | JWT |
| PUT | `/me` | Update profile + avatar | JWT |
| PUT | `/change-password` | Change password | JWT |
| GET | `/users` | All users (admin) | JWT |

### Inventory (`/api/inventory`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all (search, filter, paginate) | JWT |
| POST | `/` | Create product + image upload | JWT |
| GET | `/:id` | Get single product | JWT |
| PUT | `/:id` | Update product | JWT |
| DELETE | `/:id` | Soft delete (admin) | JWT |
| PATCH | `/:id/stock` | Update stock quantity | JWT |
| GET | `/:id/history` | Stock movement history | JWT |
| GET | `/:id/predict` | 🔮 Prediction for one product | JWT |
| GET | `/predictions/all` | 🔮 All predictions by urgency | JWT |
| GET | `/dashboard/stats` | 📊 Dashboard stats | JWT |
| POST | `/import/csv` | 📁 Bulk CSV import | JWT |
| GET | `/meta/categories` | All categories | JWT |

---

## 🔮 Prediction Engine

The prediction system (`utils/prediction.js`) uses a **Weighted Moving Average** algorithm:

- **Daily Consumption**: Weighted average of historical sales (recent = higher weight)
- **Days Until Stockout**: `currentStock / dailyConsumption`
- **Reorder Urgency**: `critical | high | medium | low | none`
- **Demand Forecast**: 30 / 60 / 90 day projections
- **Suggested Order Qty**: 90-day forecast × 1.2 safety buffer

---

## 📁 CSV Import Format

```csv
name,sku,category,quantity,unit,costPrice,sellingPrice,reorderPoint,reorderQuantity,description
Laptop Dell XPS,DELL-XPS-001,Electronics,50,units,800,1200,10,20,High performance laptop
```

---

## 🔌 Connect Your React Frontend

In your React project's `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Example API call:
```javascript
// Login
const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await res.json();

// Authenticated request
const inv = await fetch(`${process.env.REACT_APP_API_URL}/inventory`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access (CRUD + delete + all users) |
| `manager` | Create, update, import, stock updates |
| `viewer` | Read-only access |

---

## 📦 Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT + bcrypt
- **File Uploads**: Multer (images + CSV)
- **CSV Parsing**: csv-parser
