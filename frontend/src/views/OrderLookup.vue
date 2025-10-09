<script setup>
// This view is for Step 1
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const orderNumber = ref('');
const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const apiClient = axios.create({ baseURL: 'http://localhost:5002/api/returns' });

const handleLookup = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.post('/lookup', { orderNumber: orderNumber.value, email: email.value });
    if (response.data.success) {
      // Store data in session storage to pass between pages
      sessionStorage.setItem('orderData', JSON.stringify(response.data.data));
      // Navigate to the next step using the router
      router.push({ name: 'SelectItems', params: { orderId: response.data.data.orderId } });
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred.';
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
                <input type="text" id="orderNumber" v-model="orderNumber" class="w-full input" placeholder="#1001" />
            </div>
            <div class="mb-6">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" v-model="email" class="w-full input" placeholder="you@example.com" />
            </div>
            <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>
            <button type="submit" :disabled="isLoading" class="w-full btn-primary">
                <span v-if="isLoading">Finding Your Order...</span>
                <span v-else>Find Your Order</span>
            </button>
        </form>
    </div>
</template>

<style>
.input { @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-gray-900; }
.btn-primary { @apply bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 disabled:bg-gray-400; }
.error-box { @apply mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm; }
</style>