<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// This component receives the request 'id' from the URL as a prop,
// thanks to the `props: true` setting in our router.
const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const router = useRouter();

// --- State Management ---
const request = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const processingId = ref(null);

// --- API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns/admin',
});

// --- Functions ---
const fetchRequestDetails = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // This calls the new backend endpoint we will create to get a single request.
    const response = await apiClient.get(`/requests/${props.id}`);
    if (response.data.success) {
      request.value = response.data.data;
    }
  } catch (error) {
    errorMessage.value = 'Failed to load request details.';
  } finally {
    isLoading.value = false;
  }
};

const handleAction = async (action) => {
  if (!request.value) return;
  processingId.value = request.value._id;
  try {
    await apiClient.post(`/requests/${request.value._id}/${action}`);
    // If successful, navigate back to the previous page (the list view).
    router.go(-1);
  } catch (error) {
    errorMessage.value = error.response?.data?.error || `An error occurred.`;
  } finally {
    processingId.value = null;
  }
};

// Fetch the details when the component is first loaded.
onMounted(fetchRequestDetails);
</script>

<template>

<div>

  <!-- Main Header for the Detail View -->
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
    <div class="flex items-center">
      <button @click="router.go(-1)" class="text-gray-500 hover:text-gray-800 mr-4 text-sm font-medium flex items-center">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        Back
      </button>
      <h2 v-if="request" class="text-2xl font-bold text-gray-900">#{{ request.shopify_order_number }}</h2>
    </div>
    <div v-if="request" class="flex items-center space-x-3">
      <button @click="handleAction('reject')" :disabled="processingId === request._id" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Reject</button>
      <button @click="handleAction('approve')" :disabled="processingId === request._id" class="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:bg-gray-400">
        <span v-if="processingId === request._id">Processing...</span>
        <span v-else>Approve</span>
      </button>
    </div>
  </header>
  
  <!-- Main Content Area for Detail View -->
  <main class="flex-1 overflow-y-auto p-6">
    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading details...</div>
    <div v-else-if="errorMessage" class="text-center py-12 text-red-500">{{ errorMessage }}</div>
    <div v-else-if="request" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-4">
        <p class="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md border border-yellow-200">The customer raised this request on {{ new Date(request.createdAt).toLocaleDateString() }}.</p>
        <div v-for="item in request.line_items" :key="item.id" class="flex items-center space-x-4 p-3 border rounded-md">
          <img :src="item.image" alt="Product" class="w-16 h-16 rounded-md bg-gray-100 object-cover">
          <div>
            <p class="font-semibold text-gray-900">{{ item.title }}</p>
            <p class="text-sm text-gray-600">Reason: {{ item.reason }}</p>
          </div>
        </div>
        <div v-if="request.image_url">
          <h4 class="font-semibold text-sm text-gray-800 mb-2">Uploaded Image:</h4>
          <a :href="`http://localhost:5002${request.image_url}`" target="_blank" rel="noopener noreferrer">
            <img :src="`http://localhost:5002${request.image_url}`" alt="Uploaded by customer" class="rounded-md border max-w-xs hover:opacity-80 transition-opacity">
          </a>
        </div>
      </div>
      <!-- Right Column -->
      <div class="space-y-4 bg-white rounded-lg shadow-md p-6 h-fit">
        <div><h4 class="font-semibold text-sm text-gray-800">Customer</h4><p class="text-sm text-gray-600">{{ request.customer_email }}</p></div>
        <div v-if="request.request_type === 'return'"><h4 class="font-semibold text-sm text-gray-800">Refund Mode</h4><p class="text-sm text-gray-600 capitalize">{{ request.refund_mode.replace('_', ' ') }}</p></div>
        <div v-if="request.request_type === 'exchange'"><h4 class="font-semibold text-sm text-gray-800">Exchange For</h4><p class="text-sm text-gray-600">Variant ID: {{ request.exchange_for_variant_id }}</p></div>
      </div>
    </div>
  </main>
  </div>
</template>
