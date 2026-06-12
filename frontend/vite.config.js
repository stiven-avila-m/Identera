import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const AWS_API = 'https://oxedtkrjf7.execute-api.us-east-1.amazonaws.com/prod';
const API_KEY = 'a6276b1f7ad2b0379e7969cccba7e6bae9f39feb5bb20989a961a7a3813a40cd';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/login':        { target: AWS_API, changeOrigin: true, headers: { 'x-api-key': API_KEY } },
      '/usuarios':     { target: AWS_API, changeOrigin: true, headers: { 'x-api-key': API_KEY } },
      '/validaciones': { target: AWS_API, changeOrigin: true, headers: { 'x-api-key': API_KEY } },
      '/carnets':      { target: AWS_API, changeOrigin: true, headers: { 'x-api-key': API_KEY } },
      '/qr':           { target: AWS_API, changeOrigin: true, headers: { 'x-api-key': API_KEY } },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
})
