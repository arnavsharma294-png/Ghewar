import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This workspace is the user's home directory; disabling Vite's recursive watcher
// prevents it from watching unrelated folders while serving this prototype.
export default defineConfig({
  plugins: [react()],
  server: { watch: null }
})
