import { existsSync } from 'node:fs';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const wayfinderCommand = (() => {
    if (process.env.WAYFINDER_COMMAND) {
        return process.env.WAYFINDER_COMMAND;
    }

    const herdPhp = process.env.USERPROFILE
        ? `${process.env.USERPROFILE.replaceAll('\\', '/')}/.config/herd/bin/php.bat`
        : null;

    if (herdPhp && existsSync(herdPhp)) {
        return `"${herdPhp}" artisan wayfinder:generate`;
    }

    return 'php artisan wayfinder:generate';
})();

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            ssr: 'resources/js/ssr.ts',
            refresh: true,
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            command: wayfinderCommand,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
