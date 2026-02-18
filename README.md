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

### 3. PHP 8.4+ & Composer

#### Option A: Direct Installation (Recommended)

**PHP 8.4.16**

Download: [https://windows.php.net/download/](https://windows.php.net/download/)

1. Download the **non-thread-safe (NTS)** version for Windows
2. Extract to a folder (e.g., `C:\php-8.4.16`)
3. Add to System PATH:
   - Open **Environment Variables**
   - Add your PHP folder to `Path`
4. Verify:
   ```bash
   php -v
   ```

**Composer**

Download: [https://getcomposer.org/download/](https://getcomposer.org/download/)

Run the installer and add to PATH.

Verify:

```bash
composer -V
```

#### Option B: Laragon (Optional)

Download:
[https://laragon.org/](https://laragon.org/)

Laragon bundles PHP, Composer, and Nginx automatically.

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

### ❌ PHP command not found

PHP is not in your system PATH. Fix it:

**Windows:**

1. Open **Environment Variables**:
   - Right-click **This PC** → **Properties** → **Advanced system settings** → **Environment Variables**
2. Under **System variables**, click **New**:
   - Variable name: `PHP_HOME`
   - Variable value: `C:\path\to\php` (your PHP folder)
3. Edit **Path** variable and add: `%PHP_HOME%`
4. Restart terminal and verify:
   ```bash
   php -v
   ```

---

### ❌ Composer command not found

Composer is not installed or not in PATH.

**Windows:**

1. Download and run Composer installer from [https://getcomposer.org/download/](https://getcomposer.org/download/)
2. During installation, it will ask for your PHP path - point to your PHP folder
3. Verify:
   ```bash
   composer -V
   ```

---

### ❌ `.env` file not found or variables not loading

1. Ensure `.env` file exists in the project root:
   ```bash
   cp .env.example .env
   ```
2. Clear Laravel config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```
3. Verify `.env` is in `.gitignore` (should not be committed)
4. Check `.env` has correct database and queue settings:

   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=upasakay
   DB_USERNAME=upasakay_user
   DB_PASSWORD=password

   QUEUE_CONNECTION=rabbitmq
   RABBITMQ_HOST=127.0.0.1
   RABBITMQ_PORT=5672
   ```

---

### ❌ `APP_KEY` is not set

Generate it:

```bash
php artisan key:generate
```

Verify `.env` has:

```env
APP_KEY=base64:xxxxxxxxxxxx
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

---

# 🔧 ENVIRONMENT SETUP CHECKLIST

Before running the project, verify:

- [ ] PHP 8.4+ installed and in PATH
- [ ] Composer installed and in PATH
- [ ] Node.js (LTS) installed
- [ ] PostgreSQL running and accessible
- [ ] `.env` file created from `.env.example`
- [ ] `APP_KEY` generated
- [ ] Database user and permissions created
- [ ] Database migrations run successfully
- [ ] Docker running (for RabbitMQ)
- [ ] Git configured with credentials

```

```
