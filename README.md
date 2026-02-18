# UPasakay

UPasakay is a shuttle management system (mobile + web) that provides:

- Real-time shuttle location viewing
- Passenger pickup requests
- Driver-side pickup alerts
- Administrative monitoring and reporting

---

# 🧩 Tech Stack

## Backend

- Laravel (PHP)

## Web Admin

- Vue + Inertia + TypeScript + Vite

## Mobile App

- React Native (Expo)

## Database

- PostgreSQL

## Queue / Notifications

- RabbitMQ

---

# 📥 Repository Access

Clone the repository:

```bash
git clone <repo-url>
cd upasakay
```

Create feature branches from `main` and open PRs targeting `main`.

---

# SYSTEM PREREQUISITES

Each teammate must install the following **before running the project**.

---

## REQUIRED SOFTWARE

### 1. Git

Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

Verify:

```bash
git --version
```

---

### 2. Node.js (LTS Version)

Download: [https://nodejs.org](https://nodejs.org)

Verify:

```bash
node -v
npm -v
```

---

### 3. OPTIONAL: PHP + Composer (Recommended: Laragon for Windows)

Download Laragon:
[https://laragon.org/](https://laragon.org/)

This includes:

- PHP
- Composer
- Nginx (optional)

Verify:

```bash
php -v
composer -V
```

---

### 4. PostgreSQL (Database)

Download:
[https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

During installation:

- Remember your postgres password

---

### 5. Docker Desktop (For RabbitMQ)

Download:
[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Verify:

```bash
docker --version
```

---

# 🚀 INITIAL PROJECT SETUP (STEP-BY-STEP)

Follow these steps **in order**.

---

## STEP 1 — Install Project Dependencies

Inside project folder:

```bash
composer install
npm install
```

---

## STEP 2 — Configure Environment

Copy environment file:

```bash
cp .env.example .env
```

Generate app key:

```bash
php artisan key:generate
```

---

## STEP 3 — Setup PostgreSQL Database

Open **pgAdmin** or terminal and run:

```sql
CREATE DATABASE upasakay;
CREATE USER upasakay_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE upasakay TO upasakay_user;
```

---

### Update `.env`

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=upasakay
DB_USERNAME=upasakay_user
DB_PASSWORD=password
```

---

## STEP 4 — Run Database Migration

```bash
php artisan migrate --seed
```

---

## STEP 5 — Setup RabbitMQ (Queue System)

Run RabbitMQ via Docker:

```bash
docker run -d --hostname rabbit --name rabbitmq \
-p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Dashboard:

```
http://localhost:15672
user: guest
pass: guest
```

---

### Configure `.env`

```env
QUEUE_CONNECTION=rabbitmq

RABBITMQ_HOST=127.0.0.1
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
```

---

## STEP 6 — Run the Application

### Start Laravel Backend

```bash
php artisan serve
```

Runs at:

```
http://127.0.0.1:8000
```

---

### Start Frontend (Vue)

```bash
npm run dev
```

---

### Start Queue Worker (Required for notifications)

```bash
php artisan queue:work
```

---

# 📱 MOBILE APP SETUP (React Native)

Only needed for mobile developers.

---

## Install Expo CLI

```bash
npm install -g expo-cli
```

---

## Create Mobile Project

```bash
npx create-expo-app upasakay-mobile
cd upasakay-mobile
npm install axios
```

---

## Connect to Backend API

Use your **local IP address**, NOT localhost.

Example:

```js
baseURL: "http://192.168.X.X:8000/api";
```

Find IP using:

```bash
ipconfig
```

---

# 🧪 RUNNING TESTS

```bash
vendor/bin/phpunit
```

---

# 🛠️ TROUBLESHOOTING GUIDE

## Common Issues

---

### ❌ Composer install fails

Run:

```bash
composer clear-cache
composer install
```

Ensure PHP version is compatible (8.1+).

---

### ❌ Database connection error

Check:

- PostgreSQL is running
- `.env` credentials are correct
- Port is 5432

---

### ❌ Migrations fail

Run:

```bash
php artisan config:clear
php artisan migrate:fresh --seed
```

---

### ❌ npm run dev fails

Delete and reinstall:

```bash
rm -rf node_modules
npm install
```

---

### ❌ RabbitMQ not working

Ensure Docker container is running:

```bash
docker ps
```

Restart if needed:

```bash
docker restart rabbitmq
```

---

### ❌ Queue jobs not processing

Make sure queue worker is running:

```bash
php artisan queue:work
```

---

# 💡 DEVELOPMENT WORKFLOW

Recommended order:

1. Setup database
2. Run backend
3. Test API via Postman
4. Run frontend
5. Start queue worker
6. Connect mobile app

```
