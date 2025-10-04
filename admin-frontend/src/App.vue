<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- State Management ---
const allRequests = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const processingId = ref(null);
const activeTab = ref('returns'); // 'returns' or 'exchanges'
const selectedRequest = ref(null); // Holds the request to show in the detail view

// --- API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns/admin', 
});

// --- Computed Properties ---
const returnRequests = computed(() => 
  allRequests.value.filter(req => req.request_type === 'return')
);
const exchangeRequests = computed(() => 
  allRequests.value.filter(req => req.request_type === 'exchange')
);

// --- Functions ---
const fetchRequests = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get('/requests');
    if (response.data.success) {
      allRequests.value = response.data.data;
    }
  } catch (error) {
    errorMessage.value = 'Failed to load requests.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const approveRequest = async (requestId) => {
  processingId.value = requestId;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const response = await apiClient.post(`/requests/${requestId}/approve`);
    if (response.data.success) {
      successMessage.value = response.data.message;
      fetchRequests();
      selectedRequest.value = null; 
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred while approving.';
  } finally {
    processingId.value = null;
  }
};

// --- THIS IS THE NEW FUNCTION ---
const rejectRequest = async (requestId) => {
  processingId.value = requestId;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const response = await apiClient.post(`/requests/${requestId}/reject`);
    if (response.data.success) {
      successMessage.value = response.data.message;
      // Refetch the list to remove the rejected item
      fetchRequests();
      selectedRequest.value = null; // Close the detail view
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred while rejecting.';
  } finally {
    processingId.value = null;
  }
};


// --- Lifecycle Hooks ---
onMounted(fetchRequests);
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Requests</h1>
      </header>

      <div class="bg-white rounded-lg shadow-md">
        
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button @click="activeTab = 'returns'" :class="[activeTab === 'returns' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Returns <span class="bg-gray-200 text-gray-600 ml-2 py-0.5 px-2 rounded-full text-xs">{{ returnRequests.length }}</span>
            </button>
            <button @click="activeTab = 'exchanges'" :class="[activeTab === 'exchanges' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Exchanges <span class="bg-gray-200 text-gray-600 ml-2 py-0.5 px-2 rounded-full text-xs">{{ exchangeRequests.length }}</span>
            </button>
          </nav>
        </div>

        <!-- Detail View (Modal-like overlay) -->
        <div v-if="selectedRequest" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50" @click.self="selectedRequest = null">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto">
            <div class="flex justify-between items-center p-4 border-b">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Request for Order #{{ selectedRequest.shopify_order_number }}</h2>
                <p class="text-sm text-gray-500">Request ID: #{{ selectedRequest._id.slice(-6).toUpperCase() }}</p>
              </div>
              <button @click="selectedRequest = null" class="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2 space-y-4">
                <p class="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md border border-yellow-200">The customer raised this request on {{ new Date(selectedRequest.createdAt).toLocaleDateString() }}.</p>
                <div v-for="item in selectedRequest.line_items" :key="item.id" class="flex items-center space-x-4 p-3 border rounded-md">
                   <img :src="item.image" alt="Product" class="w-16 h-16 rounded-md bg-gray-100">
                   <div>
                     <p class="font-semibold text-gray-900">{{ item.title }}</p>
                     <p class="text-sm text-gray-600">Reason: {{ item.reason }}</p>
                   </div>
                </div>
                <div v-if="selectedRequest.image_url">
                  <h4 class="font-semibold text-sm text-gray-800 mb-2">Uploaded Image:</h4>
                  <img :src="`http://localhost:5002${selectedRequest.image_url}`" alt="Uploaded by customer" class="rounded-md border max-w-xs">
                </div>
              </div>
              <div class="space-y-4 bg-gray-50 p-4 rounded-md border">
                 <div><h4 class="font-semibold text-sm text-gray-800">Customer</h4><p class="text-sm text-gray-600">{{ selectedRequest.customer_email }}</p></div>
                 <div v-if="selectedRequest.request_type === 'return'"><h4 class="font-semibold text-sm text-gray-800">Refund Mode</h4><p class="text-sm text-gray-600 capitalize">{{ selectedRequest.refund_mode.replace('_', ' ') }}</p></div>
                 <div v-if="selectedRequest.request_type === 'exchange'"><h4 class="font-semibold text-sm text-gray-800">Exchange For</h4><p class="text-sm text-gray-600">Variant ID: {{ selectedRequest.exchange_for_variant_id }}</p></div>
              </div>
            </div>
            <!-- THE REJECT BUTTON NOW CALLS THE NEW FUNCTION -->
            <div class="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
              <button @click="rejectRequest(selectedRequest._id)" :disabled="processingId === selectedRequest._id" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-200">
                <span v-if="processingId === selectedRequest._id">Processing...</span>
                <span v-else>Reject</span>
              </button>
              <button @click="approveRequest(selectedRequest._id)" :disabled="processingId === selectedRequest._id" class="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:bg-gray-400">
                <span v-if="processingId === selectedRequest._id">Processing...</span>
                <span v-else>Approve</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="p-6">
          <div v-if="isLoading" class="text-center py-8 text-gray-500">Loading...</div>
          <div v-else-if="errorMessage" class="text-center py-8 text-red-500">{{ errorMessage }}</div>
          <div v-else>
            <table v-if="activeTab === 'returns'" class="min-w-full divide-y divide-gray-200">
              <thead><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th></tr></thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="req in returnRequests" :key="req._id" @click="selectedRequest = req" class="cursor-pointer hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyan-600">#{{ req._id.slice(-6).toUpperCase() }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{{ req.line_items[0].title }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ req.shopify_order_number }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ req.customer_email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ new Date(req.createdAt).toLocaleDateString() }}</td>
                </tr>
                <tr v-if="returnRequests.length === 0"><td colspan="5" class="text-center py-8 text-gray-500">No pending return requests.</td></tr>
              </tbody>
            </table>
            <table v-if="activeTab === 'exchanges'" class="min-w-full divide-y divide-gray-200">
               <thead><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th></tr></thead>
               <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="req in exchangeRequests" :key="req._id" @click="selectedRequest = req" class="cursor-pointer hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyan-600">#{{ req._id.slice(-6).toUpperCase() }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{{ req.line_items[0].title }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ req.shopify_order_number }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ req.customer_email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ new Date(req.createdAt).toLocaleDateString() }}</td>
                </tr>
                <tr v-if="exchangeRequests.length === 0"><td colspan="5" class="text-center py-8 text-gray-500">No pending exchange requests.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f3f4f6;
}
</style>
