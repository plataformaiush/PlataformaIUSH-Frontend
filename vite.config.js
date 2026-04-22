import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        legacy({
            targets: ['last 3 versions', '> 0.5%', 'not dead'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            modernPolyfills: ['es.promise.finally', 'es/map', 'es/set'],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@domain': path.resolve(__dirname, './src/domain'),
            '@application': path.resolve(__dirname, './src/application'),
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@config': path.resolve(__dirname, './src/config'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@tests': path.resolve(__dirname, './src/tests'),
        },
    },
    server: {
        port: 3000,
        host: true,
    },
    build: {
        target: 'es2015',
        outDir: 'dist',
        sourcemap: true,
        cssTarget: ['chrome61', 'firefox60', 'safari11', 'edge79'],
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
                    'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
                    'vendor-state': ['zustand'],
                },
            },
        },
    },
});
