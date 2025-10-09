import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <-- IMPORT your new router file

const app = createApp(App)

app.use(router) // <-- TELL Vue to use the router

app.mount('#app')
