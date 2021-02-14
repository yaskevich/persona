import { createApp } from 'vue'
import App from './App.vue'
import "../tailwind.css"

// import { Button, Alert, Switch } from 'equal-vue'
// import 'equal-vue/dist/style.css'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'



// import 'node_modules/equal-vue/dist/style.css'

createApp(App)
// .use(Button).use(Alert).use(Switch)
.use(ElementPlus)
.mount('#app')
