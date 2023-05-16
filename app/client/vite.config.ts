import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import eslintPlugin from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
	  react(),
//	  eslintPlugin(),
	  // ======= checker typescript ====
	  checker({
        typescript: true,
	  }),
	 // ================================
  ],
  server: {
    hmr: {
      clientPort: 8080,
    },
  }
});
