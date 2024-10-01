import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
// import 'element-plus/lib/theme-chalk/index.css'
import 'element-plus/dist/index.css';
import locale from 'element-plus/dist/locale/ru.min.mjs';
import 'dayjs/locale/ru';
import router from './router';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { pageTitle } from 'vue-page-title';

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`el-icon-${key.toLowerCase()}`, component);
}

app.use(pageTitle()).use(router).use(ElementPlus, { locale }).mount('#app');
