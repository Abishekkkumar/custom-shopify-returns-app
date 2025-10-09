<script setup>
// This App.vue is now a simple layout shell.
// It only needs to import the components from Vue Router.
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <h1 class="text-xl font-bold text-gray-800 truncate">Returns Clone</h1>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        
        <!-- RouterLink is the correct way to create navigation links. -->
        <!-- It changes the URL without a full page reload. -->
        <!-- `active-class` automatically styles the link when its 'to' prop matches the current URL. -->
        <RouterLink 
          to="/all-requests" 
          class="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
          active-class="bg-cyan-50 text-cyan-700"
        >
          All Requests
        </RouterLink>

        <RouterLink 
          to="/returns" 
          class="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
          active-class="bg-cyan-50 text-cyan-700"
        >
          Returns
        </RouterLink>

        <RouterLink 
          to="/exchanges" 
          class="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
          active-class="bg-cyan-50 text-cyan-700"
        >
          Exchanges
        </RouterLink>

      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- RouterView is the "window" where Vue Router will display the correct page. -->
      <!-- If the URL is /returns, it will render the RequestsList component here. -->
      <!-- If the URL is /requests/123, it will render the RequestDetail component here. -->
      <RouterView />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f3f4f6; /* bg-gray-100 */
}
</style>
