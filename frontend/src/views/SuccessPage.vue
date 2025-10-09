<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// A simple function to reset the flow and go back to the first page
// by navigating to the 'OrderLookup' route.
function startNewReturn() {
  router.push({ name: 'OrderLookup' });
}
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto text-center">
    <!-- Checkmark Icon -->
    <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    
    <h2 class="mt-4 text-2xl font-semibold text-green-600">Request Submitted Successfully!</h2>
    <p class="text-gray-600 mt-2">You will receive a confirmation email with next steps shortly.</p>
    
    <button @click="startNewReturn" class="mt-8 px-6 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600">
      Start another return
    </button>
  </div>
</template>

