<script setup>
import { ref } from 'vue';
import axios from 'axios';

// --- Components ---
// We import all four of our step components.
import Step1_OrderLookup from './components/Step1_OrderLookup.vue';
import Step2_SelectItems from './components/Step2_SelectItems.vue';
import Step3_ReturnDetails from './components/Step3_ReturnDetails.vue';
import Step4_Confirm from './components/Step4_Confirm.vue';

// --- State Management ---
// This reactive variable controls which step the user is currently on.
const currentStep = ref('lookup'); 
// This will hold the order data after a successful lookup.
const orderData = ref(null);
// This object will store all the information for the return request as the user fills it out.
const returnRequest = ref({
  items: [],
  requestType: '',
  refundMode: '',
  reason: '',
  imageFile: null,
  exchangeForVariantId: ''
});
const isLoading = ref(false);
const errorMessage = ref('');


// --- API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:5002/api/returns',
});

// --- Step Navigation Functions ---
// Called by Step 1 when an order is found.
const handleOrderFound = (data) => {
  orderData.value = data;
  currentStep.value = 'select'; // Move to Step 2
};

// Called by Step 2 when an item and action are selected.
const handleItemSelected = ({ item, action }) => {
  returnRequest.value.items = [item];
  returnRequest.value.requestType = action;
  currentStep.value = 'details'; // Move to Step 3
};

// Called by Step 3 when the details are submitted.
const handleDetailsSubmitted = ({ reason, refundMode, imageFile, exchangeForVariantId }) => {
  returnRequest.value.reason = reason;
  returnRequest.value.refundMode = refundMode;
  returnRequest.value.imageFile = imageFile;
  returnRequest.value.exchangeForVariantId = exchangeForVariantId;
  currentStep.value = 'confirm'; // Move to Step 4
};

// This is the final function, called by Step 4 to submit the request to the backend.
const handleSubmitRequest = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  // We must use FormData because we are sending a file (the image).
  const formData = new FormData();
  formData.append('orderId', orderData.value.orderId);
  formData.append('orderNumber', orderData.value.orderNumber);
  formData.append('email', orderData.value.email || '');
  formData.append('requestType', returnRequest.value.requestType);
  formData.append('refundMode', returnRequest.value.refundMode);

  // We add the 'reason' to each item object before sending.
  const itemsWithReason = returnRequest.value.items.map(item => ({
    ...item,
    reason: returnRequest.value.reason,
  }));
  // We stringify the items array to send it as a text field.
  formData.append('items', JSON.stringify(itemsWithReason));
  
  if (returnRequest.value.requestType === 'exchange') {
    formData.append('exchangeForVariantId', returnRequest.value.exchangeForVariantId);
  }

  if (returnRequest.value.imageFile) {
    formData.append('image', returnRequest.value.imageFile);
  }

  try {
    // Send the final data to the backend's '/create' endpoint.
    await apiClient.post('/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    currentStep.value = 'success'; // Move to the final success screen
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'There was an error submitting your request. Please try again.';
    currentStep.value = 'confirm'; // Stay on the confirm step to show the error
  } finally {
    isLoading.value = false;
  }
};

// Resets the entire flow to the beginning.
const resetFlow = () => {
  currentStep.value = 'lookup';
  orderData.value = null;
  returnRequest.value = {
    items: [], requestType: '', refundMode: '', reason: '', imageFile: null, exchangeForVariantId: ''
  };
};

</script>

<template>
  <div class="min-h-screen font-sans flex items-center justify-center p-4">
    <div class="w-full max-w-4xl">
      <main>
        <div v-if="isLoading" class="text-center p-8 bg-white rounded-lg shadow-md">
            <p class="text-gray-600 animate-pulse">Submitting your request...</p>
        </div>
        <div v-else>
          <!-- Conditionally render each step component based on the `currentStep` variable -->
          <Step1_OrderLookup 
            v-if="currentStep === 'lookup'" 
            @order-found="handleOrderFound" 
          />
          <Step2_SelectItems
            v-if="currentStep === 'select'"
            :order="orderData"
            @item-selected="handleItemSelected"
            @go-back="resetFlow"
          />
          <Step3_ReturnDetails
            v-if="currentStep === 'details'"
            :request="returnRequest"
            @details-submitted="handleDetailsSubmitted"
            @go-back="currentStep = 'select'"
          />
          <Step4_Confirm
            v-if="currentStep === 'confirm'"
            :order="orderData"
            :request="returnRequest"
            @submit-request="handleSubmitRequest"
            @go-back="currentStep = 'details'"
          />
          
          <!-- The final success message screen -->
          <div v-if="currentStep === 'success'" class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto text-center">
              <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 class="mt-4 text-2xl font-semibold text-green-600">Request Submitted Successfully!</h2>
              <p class="text-gray-600 mt-2">You will receive a confirmation email with next steps shortly.</p>
              <button @click="resetFlow" class="mt-8 px-6 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600">Start another return</button>
          </div>

          <!-- A global error message display -->
          <div v-if="errorMessage" @click="errorMessage=''" class="cursor-pointer mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
            {{ errorMessage }}
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f3f4f6; /* Tailwind's bg-gray-100 */
}
</style>
