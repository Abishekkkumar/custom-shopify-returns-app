<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  requestType: {
    type: String,
    required: true, 
  }
});

const router = useRouter();

// --- State Management ---
const allRequests = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const activeStatusFilter = ref('requested');
const activeDateFilter = ref(null); // ADDED: State for the active date filter

const statuses = ['requested', 'approved', 'rejected', 'all'];
const dateFilters = ['today', 'yesterday', 'last7days', 'last30days']; // ADDED: List of date filters

// --- API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns/admin',
});

// --- Computed Property for Filtering by Type ---
const filteredByType = computed(() => {
    // This frontend filtering is still useful if the backend sends all types
    if (props.requestType === 'all') {
        return allRequests.value;
    }
    return allRequests.value.filter(req => req.request_type === props.requestType);
});

// --- Functions ---
const fetchRequests = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // MODIFIED: We now send both status and date filters to the backend API.
    const params = {
        status: activeStatusFilter.value,
        dateRange: activeDateFilter.value,
    };
    const response = await apiClient.get('/requests', { params }); 
    if (response.data.success) {
        allRequests.value = response.data.data;
    }
  } catch (error) {
    errorMessage.value = 'Failed to load requests.';
  } finally {
    isLoading.value = false;
  }
};

const viewRequestDetails = (request) => {
  router.push({ name: 'RequestDetail', params: { id: request._id } });
};

// --- Watchers ---
// These watchers automatically re-fetch data whenever any filter changes.
watch(() => props.requestType, fetchRequests, { immediate: true });
watch(activeStatusFilter, fetchRequests);
watch(activeDateFilter, fetchRequests);

</script>

<template>
    <div>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
    <h2 class="text-2xl font-bold text-gray-900 capitalize">{{ requestType === 'all' ? 'All Requests' : `${requestType}s` }}</h2>
  </header>
  
  <main class="flex-1 overflow-y-auto p-6">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-6">
        <button v-for="status in statuses" :key="status" @click="activeStatusFilter = status" :class="[activeStatusFilter === status ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-700']" class="capitalize whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm">
          {{ status }}
        </button>
      </nav>
    </div>

    <!-- ADDED: The new row of Date Filter Buttons, as seen in the screenshot -->
    <div class="py-4 flex items-center space-x-2">
        <button v-for="filter in dateFilters" :key="filter" @click="activeDateFilter = filter" :class="[activeDateFilter === filter ? 'bg-cyan-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']" class="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md shadow-sm capitalize">
            {{ filter.replace('last7days', 'Last 7 Days').replace('last30days', 'Last 30 Days') }}
        </button>
        <button v-if="activeDateFilter" @click="activeDateFilter = null" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md">
            Remove Filter
        </button>
    </div>

    <div class="bg-white rounded-lg shadow-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
            <th v-if="requestType === 'all'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="req in filteredByType" :key="req._id" @click="viewRequestDetails(req)" class="cursor-pointer hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-cyan-600">#{{ req._id.slice(-6).toUpperCase() }}</td>
            <td v-if="requestType === 'all'" class="px-6 py-4 text-sm text-gray-600 capitalize">{{ req.request_type }}</td>
            <td class="px-6 py-4 text-sm text-gray-800">{{ req.line_items[0].title }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ req.shopify_order_number }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ req.customer_email }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(req.createdAt).toLocaleDateString() }}</td>
            <td class="px-6 py-4 text-sm"><span :class="{'bg-yellow-100 text-yellow-800': req.status === 'requested', 'bg-green-100 text-green-800': req.status === 'approved' || req.status === 'exchange_processed', 'bg-red-100 text-red-800': req.status === 'rejected'}" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">{{ req.status }}</span></td>
          </tr>
          <tr v-if="!isLoading && filteredByType.length === 0"><td :colspan="requestType === 'all' ? 7 : 6" class="text-center py-12 text-gray-500">No requests found for this filter.</td></tr>
        </tbody>
      </table>
      <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>
    </div>
  </main>
  </div>
</template>