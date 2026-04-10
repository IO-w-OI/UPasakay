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

> [!IMPORTANT]
>
> ## Recent README Update (2026-03-20)
>
> Use this quick setup checklist before running the project locally.
>
> ### 1) Running on Herd (Windows)
>
> - If your `php.ini` only contains:
>   - `variables_order = "GPCS"`
>   - `opcache.enable=1`
>   - `opcache.enable_cli=1`
> - This is expected for Herd/Herd Lite custom overrides.
> - Do not manually add extensions there.
> - Update Herd to latest, then verify PHP modules with:
>   ```bash
>   php -m
>   ```
>
> ### 2) If PHP is missing modules on Windows (manual PHP 8.4 NTS)
>
> - Download PHP 8.4 NTS from: https://windows.php.net/download/
> - Extract to a stable folder (example: `C:\php-8.4.16`).
> - Add that folder to your system `Path`.
> - Confirm:
>   ```bash
>   php -v
>   php --ini
>   ```
>
> ### 3) Frontend Commands
>
> - Development server (HMR):
>   ```bash
>   npm run dev
>   ```
> - Production build:
>   ```bash
>   npm run build
>   ```
>
> ### 4) Updating Seeders
>
> - When changing demo/test data, update files under `database/seeders/`.
> - Re-run seeders with either:
>   ```bash
>   php artisan db:seed
>   ```
>   or reset and reseed:
>   ```bash
>   php artisan migrate:fresh --seed
>   ```

> [!IMPORTANT]
>
> ## Recent README Update (2026-04-01)
>
> - If your CLI `php` lacks the `pdo_pgsql` driver on Windows, use Herd's PHP for artisan commands that interact with PostgreSQL. Example (PowerShell):
>
> ```powershell
> & "C:/Users/DELL/.config/herd/bin/php.bat" artisan migrate --force
> & "C:/Users/DELL/.config/herd/bin/php.bat" artisan db:seed --no-interaction
> ```
>
> - What changed (2026-04-01):
>   - ActivityLog now fails gracefully if the table is absent.
>   - Seeders made idempotent; migrations and seeders applied locally.
>   - Vite/Wayfinder config updated to prefer Herd PHP when available.

> ### Where to find verification URLs (when `MAIL_MAILER=log`)
>
> If your local `.env` uses the `log` mailer (the default in `.env.example`), verification emails are written to the application log instead of being sent.
>
> - Log file path: `storage/logs/laravel.log`.
> - To search the most recent verification links (PowerShell):
>
> ```powershell
> Get-Content storage/logs/laravel.log -Tail 400 | Select-String "Verify Email Address"
> ```
>
> - Or on macOS / WSL / Git Bash:
>
> ```bash
> tail -n 400 storage/logs/laravel.log | grep "Verify Email Address"
> ```
>
> - The log contains a line starting with `Verify Email Address:` followed by the full verification URL (e.g. `https://upasakay.test/email/verify/1/<hash>?expires=...&signature=...`). Copy that URL into your browser to verify the account.
> - Alternative: run MailHog locally and point `MAIL_MAILER=smtp` to `127.0.0.1:1025` to view messages at `http://localhost:8025`.
> - Quick resend via Tinker (Herd PHP example):
>
> ```powershell
> & "C:/Users/DELL/.config/herd/bin/php.bat" artisan tinker
> >>> $user = App\Models\User::where('email', 'you@example.com')->first();
> >>> $user->sendEmailVerificationNotification();
> ```

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

1. Download the **LTS** installer for Windows
2. Run the installer — ensure **"Add to PATH"** is checked during setup
3. Restart your terminal after installation
4. Verify:
   ```bash
   node -v
   npm -v
   ```

> **Note:** Node.js 18+ is required. The LTS version (20.x or 22.x) is recommended.

**If Node.js is not in PATH after installation (Windows):**

1. Open **Environment Variables**:
   - Right-click **This PC** → **Properties** → **Advanced system settings** → **Environment Variables**
2. Under **System variables**, find and edit **Path**
3. Add the Node.js install directory (default: `C:\Program Files\nodejs`)
4. Restart terminal and verify:
   ```bash
   node -v
   npm -v
   ```

---

### 3. Vite (Frontend Build Tool)

Vite is the frontend build tool used by this project. It is installed automatically as a project dependency when you run `npm install`, so **no global installation is needed**.

However, you can verify it's available after installing dependencies:

```bash
npx vite --version
```

> **Note:** Vite 7.x is used in this project. It requires Node.js 18+.

---

### 4. PHP 8.4+ & Composer

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

### 5. Laravel (Framework)

**Install Laravel Globally (Optional but Recommended)**

Once PHP and Composer are installed, run:

```bash
composer global require laravel/installer
```

Verify:

```bash
laravel --version
```

**Create New Laravel Project (if needed)**

```bash
laravel new project-name
```

Or use Composer:

```bash
composer create-project laravel/laravel project-name
```

> **Note:** This project is already a Laravel application, so you don't need to create a new project. Just run `composer install` in STEP 1.

---

### 6. PostgreSQL (Database)

Download:
[https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

During installation:

- Remember your postgres password

---

### 7. Docker Desktop (For RabbitMQ)

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

### Option A: Run Everything at Once (Recommended)

The project includes a `composer dev` script that starts the Laravel server, queue worker, and Vite dev server concurrently:

```bash
composer dev
```

This runs:

- **Laravel server** at `http://127.0.0.1:8000`
- **Queue worker** (for notifications via RabbitMQ)
- **Vite dev server** (for frontend hot-reload)

---

### Option B: Run Each Service Manually

**Start Laravel Backend:**

```bash
php artisan serve
```

Runs at:

```
http://127.0.0.1:8000
```

**Start Frontend (Vite + Vue):**

```bash
npm run dev
```

> Vite will start a dev server with hot module replacement (HMR). Changes to Vue/TypeScript files will reflect instantly in the browser.

**Start Queue Worker (Required for notifications):**

```bash
php artisan queue:work
```

---

### Building for Production

To create an optimized production build of the frontend:

```bash
npm run build
```

The compiled assets will be output to `public/build/`.

---

# 📱 MOBILE APP SETUP (React Native)

Only needed for mobile developers.

---

## Prerequisites

1. Install **Expo Go** app on your phone:
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

2. Install Expo CLI globally (optional, `npx` works too):

   ```bash
   npm install -g expo-cli
   ```

3. **(Optional) Use an Emulator instead of a physical device:**

   **Android Emulator:**
   - Install [Android Studio](https://developer.android.com/studio)
   - Open Android Studio → **More Actions** → **Virtual Device Manager**
   - Create a virtual device (e.g., Pixel 7, API 34+)
   - Start the emulator, then run:
     ```bash
     npx expo start --android
     ```

   **iOS Simulator (macOS only):**
   - Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the App Store
   - Open Xcode → **Settings** → **Platforms** → install a simulator runtime
   - Run:
     ```bash
     npx expo start --ios
     ```

   > **Tip:** You can also press `a` (Android) or `i` (iOS) in the Expo CLI terminal after running `npx expo start` to launch the emulator automatically.

---

## Install Dependencies

The mobile project already exists in the `upasakay-mobile/` folder:

```bash
cd upasakay-mobile
npm install
```

---

## Run the Mobile App

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

---

## Connect to Backend API

Use your **local IP address**, NOT `localhost`. Your phone and computer must be on the **same Wi-Fi network**.

Update the API base URL in `upasakay-mobile/api/api.ts`:

```js
baseURL: "http://192.168.X.X:8000/api";
```

Find your local IP using:

```bash
ipconfig
```

Look for the **IPv4 Address** under your Wi-Fi adapter.

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

Ensure PHP version is compatible (8.2+, see `composer.json`).

---

### ❌ Database connection error

Check:

- PostgreSQL is running
- `.env` credentials are correct
- Port is 5432

---

### ❌ `could not find driver (Connection: pgsql)`

This means PHP does not have the PostgreSQL PDO extension (`pdo_pgsql`) enabled. Laravel is working and PostgreSQL is working, but PHP doesn't know how to talk to PostgreSQL yet.

**First, check if the extensions are loaded:**

```bash
php -m
```

Look for `pdo_pgsql` and `pgsql` in the output. If both are listed, the driver is fine — check your `.env` credentials instead. If they are **missing**, follow the fix below for your setup.

---

#### Fix for Standard PHP Installation (Windows)

1. **Find your `php.ini`:**

   ```bash
   php --ini
   ```

   Look for the `Loaded Configuration File` path and open that file.

2. **Enable PostgreSQL extensions** — search for these lines and remove the semicolon `;`:

   ```ini
   ;extension=pdo_pgsql    →    extension=pdo_pgsql
   ;extension=pgsql        →    extension=pgsql
   ```

3. **Restart your terminal** completely (close and reopen).
   - If using **XAMPP** → restart Apache
   - If using **Laragon** → restart Laragon
   - If using **manual PHP** → just reopen terminal

4. **Verify:**

   ```bash
   php -m
   ```

   You should now see `pdo_pgsql` and `pgsql` in the list.

5. **Try migration again:**
   ```bash
   php artisan migrate
   ```

---

#### Fix for Herd / Herd Lite (Windows)

If you're using **Herd Lite**, your `php.ini` (e.g., `C:\Users\<user>\.config\herd-lite\bin\php.ini`) will look minimal:

```ini
variables_order = "GPCS"
opcache.enable=1
opcache.enable_cli=1
```

This is **normal** — it's just a custom override, not the full PHP config. **Do NOT manually edit this file** to enable extensions.

Herd ships with PostgreSQL extensions enabled by default. If `pdo_pgsql` is missing:

1. **Update Herd** to the latest version
2. **Switch PHP version** if needed:
   ```bash
   herd use php
   ```
3. Or **reinstall PHP** through Herd's settings

After updating, verify with `php -m` and run `php artisan migrate`.

---

#### Why This Happens

Laravel uses PHP's PDO drivers to connect to databases. PHP ships with several database drivers, but they may not all be enabled by default:

| Database   | PDO Extension |
| ---------- | ------------- |
| MySQL      | `pdo_mysql`   |
| PostgreSQL | `pdo_pgsql`   |
| SQLite     | `pdo_sqlite`  |

On fresh Windows PHP installs, only MySQL is typically enabled. Since this project uses PostgreSQL, you must enable `pdo_pgsql` manually (unless using Herd, which enables it automatically).

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

If you see port conflicts, Vite may already be running. Kill the process or use a different port:

```bash
npm run dev -- --port 5174
```

---

### ❌ Vite build fails or assets not loading

1. Ensure Node.js 18+ is installed:
   ```bash
   node -v
   ```
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
3. If production assets are missing, rebuild:
   ```bash
   npm run build
   ```
4. Check that `public/build/` contains the compiled assets

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

### ❌ Node.js / npm command not found

Node.js is not in your system PATH.

**Windows:**

1. Open **Environment Variables**:
   - Right-click **This PC** → **Properties** → **Advanced system settings** → **Environment Variables**
2. Under **System variables**, find and edit **Path**
3. Add: `C:\Program Files\nodejs` (or your Node.js install folder)
4. Restart terminal and verify:
   ```bash
   node -v
   npm -v
   ```

If still not working, reinstall Node.js from [https://nodejs.org](https://nodejs.org) and ensure **"Add to PATH"** is checked.

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

# 🧩 RECOMMENDED VS CODE EXTENSIONS

Install these extensions for the best development experience:

### Essential

| Extension                     | ID                                    | Purpose                                        |
| ----------------------------- | ------------------------------------- | ---------------------------------------------- |
| **Vue - Official**            | `Vue.volar`                           | Vue 3 language support, TypeScript integration |
| **TypeScript Vue Plugin**     | `Vue.vscode-typescript-vue-plugin`    | TypeScript support inside `.vue` files         |
| **ESLint**                    | `dbaeumer.vscode-eslint`              | JavaScript/TypeScript linting                  |
| **Prettier**                  | `esbenp.prettier-vscode`              | Code formatting                                |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss`           | Tailwind class autocomplete & hover preview    |
| **PHP Intelephense**          | `bmewburn.vscode-intelephense-client` | PHP language support & autocompletion          |
| **Laravel Blade Snippets**    | `onecentlin.laravel-blade`            | Blade template syntax highlighting             |

### Mobile Development

| Extension                     | ID                                | Purpose                                   |
| ----------------------------- | --------------------------------- | ----------------------------------------- |
| **ES7+ React/Redux Snippets** | `dsznajder.es7-react-js-snippets` | React Native code snippets                |
| **React Native Tools**        | `msjsdiag.vscode-react-native`    | Debugging & IntelliSense for React Native |

### Recommended

| Extension          | ID                             | Purpose                                 |
| ------------------ | ------------------------------ | --------------------------------------- |
| **DotENV**         | `mikestead.dotenv`             | `.env` file syntax highlighting         |
| **GitLens**        | `eamodio.gitlens`              | Git blame, history & annotations        |
| **Thunder Client** | `rangav.vscode-thunder-client` | REST API testing (Postman alternative)  |
| **Docker**         | `ms-azuretools.vscode-docker`  | Docker container management             |
| **EditorConfig**   | `EditorConfig.EditorConfig`    | Consistent coding styles across editors |

> **Quick Install:** Open VS Code, press `Ctrl+Shift+X`, and search for each extension by its ID.

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

# � USEFUL COMMANDS REFERENCE

| Command                            | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `composer dev`                     | Start server + queue + Vite concurrently |
| `php artisan serve`                | Start Laravel backend only               |
| `npm run dev`                      | Start Vite dev server only               |
| `npm run build`                    | Build frontend for production            |
| `php artisan queue:work`           | Start queue worker                       |
| `php artisan migrate --seed`       | Run migrations with seeders              |
| `php artisan migrate:fresh --seed` | Reset & re-run all migrations            |
| `php artisan config:clear`         | Clear cached config                      |
| `php artisan route:list`           | List all registered routes               |
| `vendor/bin/phpunit`               | Run backend tests                        |
| `npm run lint`                     | Lint frontend code                       |
| `npm run format`                   | Format frontend code with Prettier       |

---

# 🔧 ENVIRONMENT SETUP CHECKLIST

Before running the project, verify:

- [ ] Git installed and configured
- [ ] PHP 8.2+ installed and in PATH
- [ ] Composer installed and in PATH
- [ ] Node.js 18+ (LTS) installed and in PATH
- [ ] Vite available (`npx vite --version` works after `npm install`)
- [ ] PostgreSQL running and accessible
- [ ] `.env` file created from `.env.example`
- [ ] `APP_KEY` generated
- [ ] Database user and permissions created
- [ ] Database migrations run successfully
- [ ] Docker running (for RabbitMQ)
- [ ] RabbitMQ container started and accessible

```

```
