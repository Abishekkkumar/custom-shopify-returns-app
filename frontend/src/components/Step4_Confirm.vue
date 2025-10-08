<!-- frontend/src/components/Step4_Confirm.vue -->
<script setup>
import { computed } from 'vue';

// This component receives the full order and request objects from the parent
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  request: {
    type: Object,
    required: true,
  },
});

// It emits events to go back or to submit the final request
const emit = defineEmits(['submitRequest', 'goBack']);

// A "computed property" to format the shipping address into a single string for display.
// It's "computed" because it automatically updates if the `order` prop changes.
const shippingAddress = computed(() => {
  const adr = props.order.shippingAddress;
  if (!adr) return 'No address on file.';
  return `${adr.name}, ${adr.address1}, ${adr.city}, ${adr.province_code} ${adr.zip}, ${adr.country}`;
});

// A simple function to tell the parent (App.vue) to submit the request.
function submit() {
  emit('submitRequest');
}
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
    <div class="mb-8">
        <div class="flex items-center justify-center space-x-4 text-sm">
            <!-- Progress bar at the top -->
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">1</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">2</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">3</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-500 font-bold">4</span>
        </div>
        <h2 class="text-2xl font-semibold text-center text-gray-800 mt-4">Confirm Your Request</h2>
    </div>

    <div class="space-y-6">
      <!-- Item Summary -->
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Item to {{ request.requestType }}:</h3>
        <div class="border rounded-md p-4">
          <div class="flex items-center">
            <img :src="request.items[0]?.image" alt="Product" class="w-16 h-16 rounded-md mr-4 bg-gray-100 object-cover">
            <div>
              <p class="font-semibold">{{ request.items[0]?.title }}</p>
              <p class="text-sm text-gray-600">Qty: {{ request.items[0]?.quantity }}</p>
              <p class="text-sm text-gray-500">Reason: {{ request.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Refund/Exchange Details -->
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Request Details:</h3>
        <div class="border rounded-md p-4 text-sm text-gray-600 space-y-2">
          <p v-if="request.requestType === 'return'"><strong>Refund Method:</strong> {{ request.refundMode === 'store_credit' ? 'Store Credit' : 'Original Payment Method' }}</p>
          <p v-if="request.requestType === 'exchange'"><strong>Exchange For:</strong> New Item (Variant ID: {{ request.exchangeForVariantId }})</p>
          <p v-if="request.imageFile"><strong>Image Uploaded:</strong> {{ request.imageFile.name }}</p>
        </div>
      </div>
      
      <!-- Address Verification -->
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Shipping Address:</h3>
        <div class="border rounded-md p-4 text-sm text-gray-600">
          <p>{{ shippingAddress }}</p>
        </div>
      </div>
    </div>


    <div class="flex items-center justify-between mt-8">
      <button type="button" @click="emit('goBack')" class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
      <button @click="submit" class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md hover:bg-cyan-600">Submit Request</button>
    </div>
  </div>
</template>