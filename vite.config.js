import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue( )],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 為了部署到 GitHub Pages，需要設定正確的 base 路徑
  // 請將 'your-repo-name' 換成您在 GitHub 上的倉庫名稱
  base: process.env.NODE_ENV === 'production' ? '/10yearsplan/' : '/',
})
