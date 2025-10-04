<script setup>
import { ref } from 'vue';
import axios from 'axios';

// --- Components ---
import Step1_OrderLookup from './components/Step1_OrderLookup.vue';
import Step2_SelectItems from './components/Step2_SelectItems.vue';
import Step3_ReturnDetails from './components/Step3_ReturnDetails.vue';
import Step4_Confirm from './components/Step4_Confirm.vue';

// --- State Management ---
const currentStep = ref('lookup'); 
const orderData = ref(null);
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
const handleOrderFound = (data) => {
  orderData.value = data;
  currentStep.value = 'select';
};

const handleItemSelected = ({ item, action }) => {
  returnRequest.value.items = [item];
  returnRequest.value.requestType = action;
  currentStep.value = 'details';
};

const handleDetailsSubmitted = ({ reason, refundMode, imageFile, exchangeForVariantId }) => {
  returnRequest.value.reason = reason;
  returnRequest.value.refundMode = refundMode;
  returnRequest.value.imageFile = imageFile;
  returnRequest.value.exchangeForVariantId = exchangeForVariantId;
  currentStep.value = 'confirm';
};

const handleSubmitRequest = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('orderId', orderData.value.orderId);
  formData.append('orderNumber', orderData.value.orderNumber);
  
  const email = orderData.value.email || orderData.value.customer?.email || '';
  formData.append('email', email);

  formData.append('requestType', returnRequest.value.requestType);
  formData.append('refundMode', returnRequest.value.refundMode);

  const itemsWithReason = returnRequest.value.items.map(item => ({
    ...item,
    reason: returnRequest.value.reason,
  }));
  formData.append('items', JSON.stringify(itemsWithReason));
  
  if (returnRequest.value.requestType === 'exchange') {
    formData.append('exchangeForVariantId', returnRequest.value.exchangeForVariantId);
  }

  if (returnRequest.value.imageFile) {
    formData.append('image', returnRequest.value.imageFile);
  }

  try {
    await apiClient.post('/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    currentStep.value = 'success';
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'There was an error submitting your request. Please try again.';
    currentStep.value = 'confirm';
  } finally {
    isLoading.value = false;
  }
};


const resetFlow = () => {
  currentStep.value = 'lookup';
  orderData.value = null;
  returnRequest.value = {
    items: [], requestType: '', refundMode: '', reason: '', imageFile: null, exchangeForVariantId: ''
  };
};

</script>

<template>
  <!-- This main div is now a flex container. It will center its child (the content box) -->
  <!-- both vertically (`items-center`) and horizontally (`justify-center`). -->
  <div class="min-h-screen w-full font-sans flex items-center justify-center p-4">
    
    <!-- This is the main content box that will be centered on the page. -->
    <div class="w-full max-w-4xl">

      <header class="bg-white shadow-md py-6 px-4 sm:px-6 lg:px-8 rounded-t-lg">
        <h1 class="text-3xl font-bold text-center text-gray-800">Returns & Exchanges</h1>
      </header>

      <main class="py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-md rounded-b-lg">
        
        <div v-if="isLoading" class="text-center p-8">
            <p class="text-gray-600 animate-pulse">Submitting your request...</p>
        </div>

        <div v-else>
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
          
          <div v-if="currentStep === 'success'" class="bg-white p-8 rounded-lg w-full max-w-lg mx-auto text-center">
              <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 class="mt-4 text-2xl font-semibold text-green-600">Request Submitted Successfully!</h2>
              <p class="text-gray-600 mt-2">You will receive a confirmation email with next steps shortly.</p>
              <button @click="resetFlow" class="mt-8 px-6 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600">Start another return</button>
          </div>

          <div v-if="errorMessage" @click="errorMessage=''" class="cursor-pointer mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
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

