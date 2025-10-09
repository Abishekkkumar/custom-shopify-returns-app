<script setup>
// This App.vue is now just a simple layout shell.
// We only need to import the RouterView component from Vue Router.
import { RouterView } from 'vue-router';
</script>

<template>
  <!-- This is the main layout container that centers the content on the page -->
  <div class="min-h-screen font-sans flex items-center justify-center p-4">
    <div class="w-full max-w-4xl">
      <main>
        <!-- RouterView is the magic component from Vue Router. -->
        <!-- It acts as a placeholder that will be automatically filled with the -->
        <!-- correct page (e.g., OrderLookup.vue, SelectItems.vue) based on -->
        <!-- the current URL in the browser's address bar. -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Import a clean, modern font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

/* These global styles will apply to all pages of your customer portal */
body {
  margin: 0;
  background-color: #eef2f3;
  background-image: 
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.15), transparent 30%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.15), transparent 30%);
  font-family: 'Inter', sans-serif;
}

/* --- THIS IS THE CORRECTED CSS --- */

/* This global style targets the main titles (h2) with a more vibrant gradient */
main h2 {
  font-size: 1.875rem; /* 3xl */
  font-weight: 800; /* extrabold */
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to right, #9333ea, #db2777, #ef4444);
}

/* We define some shared styles here to keep our view components clean */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  color: #111827;
  transition: all 0.2s ease-in-out;
}
.input:focus {
  outline: none;
  --tw-ring-color: rgb(165 180 252 / 0.5);
  box-shadow: 0 0 0 3px var(--tw-ring-color);
  border-color: transparent;
}

.btn-primary {
  width: 100%;
  background-image: linear-gradient(to right, #a855f7, #ec4899, #ef4444);
  color: white;
  font-weight: 700;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
}
.btn-primary:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
  filter: saturate(1.5);
}
.btn-primary:disabled {
  background-image: linear-gradient(to right, #9ca3af, #6b7280);
  cursor: not-allowed;
  transform: translateY(0);
}

.error-box { 
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>

