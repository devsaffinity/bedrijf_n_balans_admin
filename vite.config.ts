import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Expose only the public web-app configuration, never service-account credentials.
  const publicKeys = ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID', 'STORAGE_BUCKET']
  return {
    plugins: [react(), tailwindcss()],
    define: Object.fromEntries(publicKeys.map((key) => [
      `import.meta.env.VITE_FIREBASE_${key}`,
      JSON.stringify(env[`VITE_FIREBASE_${key}`] || env[`FIREBASE_${key}`] || ''),
    ])),
  }
})
