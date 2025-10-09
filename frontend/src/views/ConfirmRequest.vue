<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const order = ref(null);
const request = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

// On component load, retrieve all the data that the previous steps
// have saved into the browser's session storage.
onMounted(() => {
  const storedOrder = sessionStorage.getItem('orderData');
  const storedRequest = sessionStorage.getItem('returnRequest');
  if (storedOrder && storedRequest) {
    order.value = JSON.parse(storedOrder);
    request.value = JSON.parse(storedRequest);
  } else {
    // If data is missing, send the user back to the start.
    router.push({ name: 'OrderLookup' });
  }
});

// A computed property to format the shipping address into a single, readable string.
const shippingAddress = computed(() => {
  const adr = order.value?.shippingAddress;
  if (!adr) return 'No address on file.';
  return `${adr.name}, ${adr.address1}, ${adr.city}, ${adr.province_code} ${adr.zip}, ${adr.country}`;
});

const apiClient = axios.create({ baseURL: 'http://localhost:5002/api/returns' });

// This function is the final step. It gathers all the data and sends it
// to the backend to be saved.
const handleSubmitRequest = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  // We must use FormData because we might be sending a file (the image).
  const formData = new FormData();
  formData.append('orderId', order.value.orderId);
  formData.append('orderNumber', order.value.orderNumber);
  formData.append('email', order.value.email || '');
  formData.append('requestType', request.value.requestType);
  formData.append('refundMode', request.value.refundMode);

  const itemsWithReason = request.value.items.map(item => ({
    ...item,
    reason: request.value.reason,
  }));
  formData.append('items', JSON.stringify(itemsWithReason));
  
  if (request.value.requestType === 'exchange') {
    formData.append('exchangeForVariantId', request.value.exchangeForVariantId);
  }

  // Note: Handling file objects from session storage is complex.
  // For simplicity, this version does not resubmit the image file itself,
  // but the backend is ready for it if we add that logic later.

  try {
    await apiClient.post('/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // On success, clean up session storage and navigate to the final success page.
    sessionStorage.removeItem('orderData');
    sessionStorage.removeItem('returnRequest');
    router.push({ name: 'SuccessPage' });
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'An error occurred during submission.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="request && order" class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
    <div class="mb-8">
        <div class="flex items-center justify-center space-x-4 text-sm">
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">1</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">2</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">3</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-500 font-bold">4</span>
        </div>
        <h2 class="text-2xl font-semibold text-center text-gray-800 mt-4">Confirm Your Request</h2>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Item to {{ request.requestType }}:</h3>
        <div class="border rounded-md p-4">
          <div class="flex items-center">
            <img :src="request.items[0]?.image" alt="Product" class="w-16 h-16 rounded-md mr-4 bg-gray-100 object-cover">
            <div>
              <p class="font-semibold">{{ request.items[0]?.title }}</p>
              <p class="text-sm text-gray-500">Reason: {{ request.reason }}</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Request Details:</h3>
        <div class="border rounded-md p-4 text-sm text-gray-600 space-y-2">
          <p v-if="request.requestType === 'return'"><strong>Refund Method:</strong> {{ request.refundMode === 'store_credit' ? 'Store Credit' : 'Original Payment Method' }}</p>
          <p v-if="request.requestType === 'exchange'"><strong>Exchange For:</strong> New Item (Variant ID: {{ request.exchangeForVariantId }})</p>
        </div>
      </div>
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Shipping Address:</h3>
        <div class="border rounded-md p-4 text-sm text-gray-600">
          <p>{{ shippingAddress }}</p>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-box mt-6">{{ errorMessage }}</div>

    <div class="flex items-center justify-between mt-8">
      <button type="button" @click="router.go(-1)" class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
      <button @click="handleSubmitRequest" :disabled="isLoading" class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md hover:bg-cyan-600 disabled:bg-gray-400">
        <span v-if="isLoading">Submitting...</span>
        <span v-else>Submit Request</span>
      </button>
    </div>
  </div>
</template>