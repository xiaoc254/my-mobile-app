import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
      // 在开发环境中允许无效证书
      rejectUnauthorized: false,
    }, // 自签名证书配置
    open: true,
    allowedHosts: true, // 放开所有来源，便于内网穿透域名访问
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 不改写前缀，后端挂在 /api 下
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
,
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['vant'],
          router: ['react-router-dom']
        }
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
