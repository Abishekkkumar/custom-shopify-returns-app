<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- State Management ---
const allRequests = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const processingId = ref(null);

// This is the key to the new UI. It controls whether we see the list or the detail page.
const currentView = ref('list'); // 'list' or 'detail'
const selectedRequest = ref(null); // Will hold the data for the selected request

// Controls the sidebar and main list filtering
const activeMenu = ref('home'); // 'home', 'returns', 'exchanges'
const activeStatusFilter = ref('requested');

const statuses = ['requested', 'approved', 'rejected', 'all'];

// --- API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns/admin',
});

// --- Computed Properties for Filtering ---
const filteredRequests = computed(() => {
  let requests = allRequests.value;
  if (activeMenu.value === 'returns') {
    requests = requests.filter(req => req.request_type === 'return');
  } else if (activeMenu.value === 'exchanges') {
    requests = requests.filter(req => req.request_type === 'exchange');
  }
  if (activeStatusFilter.value !== 'all') {
    requests = requests.filter(req => req.status === activeStatusFilter.value);
  }
  return requests;
});

// --- Functions ---
const fetchRequests = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get('/requests?status=all');
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

const handleAction = async (action, requestId) => {
  processingId.value = requestId;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const response = await apiClient.post(`/requests/${requestId}/${action}`);
    if (response.data.success) {
      successMessage.value = response.data.message;
      goBackToList(); // Go back to the list and refresh
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || `An error occurred.`;
  } finally {
    processingId.value = null;
  }
};

// This function switches to the detail view
const viewRequestDetails = (request) => {
  selectedRequest.value = request;
  currentView.value = 'detail';
};

// This function switches back to the list view and refreshes the data
const goBackToList = () => {
  selectedRequest.value = null;
  currentView.value = 'list';
  fetchRequests();
};

onMounted(fetchRequests);
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar Navigation -->
    <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <h1 class="text-xl font-bold text-gray-800 truncate">Returns Clone</h1>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        <a @click.prevent="activeMenu = 'home'; goBackToList()" href="#" :class="[activeMenu === 'home' ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-gray-50']" class="flex items-center px-4 py-2 text-sm font-medium rounded-md">All Requests</a>
        <a @click.prevent="activeMenu = 'returns'; goBackToList()" href="#" :class="[activeMenu === 'returns' ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-gray-50']" class="flex items-center px-4 py-2 text-sm font-medium rounded-md">Returns</a>
        <a @click.prevent="activeMenu = 'exchanges'; goBackToList()" href="#" :class="[activeMenu === 'exchanges' ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-gray-50']" class="flex items-center px-4 py-2 text-sm font-medium rounded-md">Exchanges</a>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Main Header: The `justify-between` class is key here -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <!-- Left Side of Header -->
        <div class="flex items-center">
          <button v-if="currentView === 'detail'" @click="goBackToList" class="text-gray-500 hover:text-gray-800 mr-4 text-sm font-medium flex items-center">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </button>
           <h2 v-if="currentView === 'detail' && selectedRequest" class="text-2xl font-bold text-gray-900">#{{ selectedRequest.shopify_order_number }}</h2>
        </div>
        <!-- Right Side of Header (for action buttons) -->
        <div class="flex items-center">
          <div v-if="currentView === 'detail' && selectedRequest" class="space-x-3">
             <button @click="handleAction('reject', selectedRequest._id)" :disabled="processingId === selectedRequest._id" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Reject</button>
             <button @click="handleAction('approve', selectedRequest._id)" :disabled="processingId === selectedRequest._id" class="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 disabled:bg-gray-400">
               <span v-if="processingId === selectedRequest._id">Processing...</span>
               <span v-else>Approve</span>
             </button>
          </div>
        </div>
      </header>
      
      <main class="flex-1 overflow-y-auto p-6">
        
        <!-- List View: Only shown when currentView is 'list' -->
        <div v-if="currentView === 'list'">
          <h2 class="text-2xl font-bold text-gray-900 capitalize mb-4">{{ activeMenu }}</h2>
          <div class="border-b border-gray-200 mb-4">
            <nav class="-mb-px flex space-x-6">
              <button v-for="status in statuses" :key="status" @click="activeStatusFilter = status" :class="[activeStatusFilter === status ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700']" class="capitalize whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm">
                {{ status }}
              </button>
            </nav>
          </div>
          <div class="bg-white rounded-lg shadow-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="req in filteredRequests" :key="req._id" @click="viewRequestDetails(req)" class="cursor-pointer hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-cyan-600">#{{ req._id.slice(-6).toUpperCase() }}</td>
                  <td class="px-6 py-4 text-sm text-gray-800">{{ req.line_items[0].title }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ req.shopify_order_number }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ req.customer_email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(req.createdAt).toLocaleDateString() }}</td>
                   <td class="px-6 py-4 text-sm"><span :class="{'bg-yellow-100 text-yellow-800': req.status === 'requested', 'bg-green-100 text-green-800': req.status === 'approved' || req.status === 'exchange_processed', 'bg-red-100 text-red-800': req.status === 'rejected'}" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">{{ req.status }}</span></td>
                </tr>
                <tr v-if="filteredRequests.length === 0"><td colspan="6" class="text-center py-12 text-gray-500">No requests found for this filter.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detail View: Only shown when currentView is 'detail' -->
        <div v-if="currentView === 'detail' && selectedRequest">
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left Column for item details -->
              <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-4">
                 <p class="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md border border-yellow-200">The customer raised this request on {{ new Date(selectedRequest.createdAt).toLocaleDateString() }}.</p>
                <div v-for="item in selectedRequest.line_items" :key="item.id" class="flex items-center space-x-4 p-3 border rounded-md">
                   <img :src="item.image" alt="Product" class="w-16 h-16 rounded-md bg-gray-100 object-cover">
                   <div>
                     <p class="font-semibold text-gray-900">{{ item.title }}</p>
                     <p class="text-sm text-gray-600">Reason: {{ item.reason }}</p>
                   </div>
                </div>
                <div v-if="selectedRequest.image_url">
                  <h4 class="font-semibold text-sm text-gray-800 mb-2">Uploaded Image:</h4>
                  <a :href="`http://localhost:5002${selectedRequest.image_url}`" target="_blank" rel="noopener noreferrer">
                    <img :src="`http://localhost:5002${selectedRequest.image_url}`" alt="Uploaded by customer" class="rounded-md border max-w-xs hover:opacity-80 transition-opacity">
                  </a>
                </div>
              </div>
              <!-- Right Column for context details -->
              <div class="space-y-4 bg-white rounded-lg shadow-md p-6">
                 <div><h4 class="font-semibold text-sm text-gray-800">Customer</h4><p class="text-sm text-gray-600">{{ selectedRequest.customer_email }}</p></div>
                 <div v-if="selectedRequest.request_type === 'return'"><h4 class="font-semibold text-sm text-gray-800">Refund Mode</h4><p class="text-sm text-gray-600 capitalize">{{ selectedRequest.refund_mode.replace('_', ' ') }}</p></div>
                 <div v-if="selectedRequest.request_type === 'exchange'"><h4 class="font-semibold text-sm text-gray-800">Exchange For</h4><p class="text-sm text-gray-600">Variant ID: {{ selectedRequest.exchange_for_variant_id }}</p></div>
              </div>
           </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f3f4f6;
}
</style>
