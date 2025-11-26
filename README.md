

# 🚦 How to Run GMRT Backend + Frontend (Quick Setup)

## ✅ 1. Install Requirements

You need:

* **Python 3.9+**
* **Node.js 16+**
* **npm** (comes with Node)

Check versions:

```bash
python3 --version
node -v
npm -v
```

---

## ✅ 2. Run the Backend (Flask + GMRT)

### Step 1 — Setup environment

```bash
cd traffic-gmrt/backend
python3 -m venv venv
source venv/bin/activate   # macOS / Linux
```

### Step 2 — Install Python packages

```bash
pip install --upgrade pip
pip install flask flask-cors torch numpy
```

### Step 3 — Start backend server

```bash
python3 app.py
```

Backend runs on:

```
http://localhost:5001
```

Test:

```
http://localhost:5001/api/health
```

---

## ✅ 3. Run the Frontend (React Dashboard)

### Step 1 — Install dependencies

```bash
cd ../frontend
npm install
npm install lucide-react
```

### Step 2 — Start React app

```bash
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🎉 Done!

* Backend must be running on port **5001**
* Frontend must run on port **3000**
* The dashboard will fetch data from the Flask API automatically.
