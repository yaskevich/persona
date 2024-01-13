import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  server: {
    port: Number(loadEnv('', process.cwd(), 'VITE_PORT')?.['VITE_PORT']) || 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:' + loadEnv('', process.cwd(), 'VITE_PROXY')?.['VITE_PROXY'] || String(8081),
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
