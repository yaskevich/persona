import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import locale from 'element-plus/lib/locale/lang/ru'
import 'dayjs/locale/ru'
import router from './router'
import { createMetaManager } from "vue-meta"

createApp(App)
  .use(createMetaManager())
  .use(router)
  .use(ElementPlus, { locale })
  .mount('#app');
