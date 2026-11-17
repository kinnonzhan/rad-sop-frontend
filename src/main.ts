import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import App from './App.vue'
import './styles/index.css'

const app = createApp(App)
app.use(Antd)
app.use(VXETable)
app.mount('#app')
