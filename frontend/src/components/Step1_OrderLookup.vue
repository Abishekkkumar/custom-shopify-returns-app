<!-- frontend/src/components/Step1_OrderLookup.vue -->
<script setup>
import { ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['orderFound']);

const orderNumber = ref('');
const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns',
});

const handleLookup = async () => {
  if (!orderNumber.value || !email.value) {
    errorMessage.value = 'Please enter both your order number and email.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiClient.post('/lookup', {
      orderNumber: orderNumber.value,
      email: email.value,
    });
    
    if (response.data.success) {
      emit('orderFound', response.data.data);
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto">
    <h2 class="text-2xl font-semibold text-center text-gray-800 mb-6">Start Your Return or Exchange</h2>
    <p class="text-center text-gray-600 mb-8">Enter your order number and email address to begin.</p>
    
    <form @submit.prevent="handleLookup">
      <div class="mb-4">
        <label for="orderNumber" class="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
        <input 
          type="text" 
          id="orderNumber"
          v-model="orderNumber"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          placeholder="#1001"
        />
      </div>
      
      <div class="mb-6">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input 
          type="email" 
          id="email"
          v-model="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          placeholder="you@example.com"
        />
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
        {{ errorMessage }}
      </div>
      
      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
      >
        <span v-if="isLoading">Finding Your Order...</span>
        <span v-else>Find Your Order</span>
      </button>
    </form>
  </div>
</template>
