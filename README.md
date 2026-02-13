# UPasakay

UPasakay is a shuttle management system (mobile + web) that provides:

- Real-time shuttle location viewing
- Passenger pickup requests
- Driver-side pickup alerts
- Administrative monitoring and reporting

**Tech stack**

- Backend: PHP (Laravel)
- Frontend: TypeScript, Vite, Inertia
- Mobile: React Native

**Quick start (development)**

Prerequisites: PHP, Composer, Node.js, npm/yarn

Install dependencies:

```bash
composer install
npm install
```

Environment:

1. Copy `.env.example` to `.env` and configure database and other keys.
2. Run migrations and seeders:

```bash
php artisan migrate --seed
```

Run the app:

```bash
php artisan serve
npm run dev
```

Run tests:

```bash
vendor/bin/phpunit
```

**Contributing**

Please follow the project's coding standards and open PRs against the `main` branch. Add tests for any new functionality.

**License**

See the project root for licensing details.
