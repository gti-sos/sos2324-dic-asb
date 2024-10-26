import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      input: 'src/index.html',  // Asegúrate de que este sea el archivo de entrada correcto
      external: ['echarts', 'd3'], // Agrega 'd3' aquí también si es necesario
    }
  }
});
