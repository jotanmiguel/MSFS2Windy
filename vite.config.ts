import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.test.ts', 'src/**/*.{test,spec}.ts'],
        setupFiles: ['./tests/setup.ts'], // se precisares de setup global
    },
});
