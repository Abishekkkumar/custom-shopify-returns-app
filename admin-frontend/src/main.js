import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import your router file

// We don't need to import a separate CSS file here
// because Tailwind is loaded via a script in index.html.

const app = createApp(App)

app.use(router) // Tell Vue to use the router

app.mount('#app')

