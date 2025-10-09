<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const request = ref(null);

// Form state for this view
const reason = ref('');
const refundMode = ref('store_credit');
const imageFile = ref(null);
const imagePreview = ref('');
const exchangeForVariantId = ref('');

const returnReasons = [
  'Did not like the product',
  'Received wrong item',
  'Received damaged item',
  'Item does not fit',
  'Others',
];

onMounted(() => {
  const storedRequest = sessionStorage.getItem('returnRequest');
  if (storedRequest) {
    request.value = JSON.parse(storedRequest);
  } else {
    router.push({ name: 'OrderLookup' });
  }
});

function submitDetails() {
  const updatedRequest = {
    ...request.value,
    reason: reason.value,
    refundMode: request.value.requestType === 'return' ? refundMode.value : null,
    imageFile: imageFile.value, // We'll handle the actual file object later
    exchangeForVariantId: exchangeForVariantId.value,
  };
  sessionStorage.setItem('returnRequest', JSON.stringify(updatedRequest));
  router.push({ name: 'ConfirmRequest' });
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
}
</script>

<template>
  <div v-if="request" class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
    <div class="mb-8">
      <div class="flex items-center justify-center space-x-4 text-sm">
        <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">1</span>
        <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">2</span>
        <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-500 font-bold">3</span>
        <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400">4</span>
      </div>
      <h2 class="text-2xl font-semibold text-center text-gray-800 mt-4">Why do you want to {{ request.requestType }}?</h2>
    </div>

    <div class="border p-4 rounded-md mb-6">
      <p class="text-sm font-medium text-gray-500 mb-2">Item(s) you will {{ request.requestType }} (1)</p>
      <div class="flex items-center">
        <img :src="request.items[0]?.image" alt="Product" class="w-16 h-16 rounded-md mr-4 bg-gray-100 object-cover">
        <div>
          <p class="font-semibold">{{ request.items[0]?.title }}</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="submitDetails">
      <div class="mb-6">
        <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <select id="reason" v-model="reason" required class="w-full input">
          <option disabled value="">Please select a reason</option>
          <option v-for="r in returnReasons" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div v-if="request.requestType === 'exchange'" class="mb-6">
        <label for="exchangeId" class="block text-sm font-medium text-gray-700 mb-1">New Product Variant ID</label>
        <input type="text" id="exchangeId" v-model="exchangeForVariantId" required class="w-full input" placeholder="Enter Variant ID for new item"/>
        <p class="text-xs text-gray-500 mt-1">You can find this on the new product's page.</p>
      </div>

      <div v-if="request.requestType === 'return'" class="mb-6">
        <h3 class="block text-sm font-medium text-gray-700 mb-2">How would you like to receive the refund?</h3>
        <div @click="refundMode = 'store_credit'" :class="{'border-cyan-500 ring-2 ring-cyan-500': refundMode === 'store_credit'}" class="cursor-pointer border rounded-md p-4 flex items-center space-x-4">
          <input type="radio" id="store_credit" value="store_credit" v-model="refundMode" class="hidden">
          <div class="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <label for="store_credit" class="font-semibold text-gray-700">Store Credit</label>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
        <input type="file" @change="handleImageUpload" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
        <img v-if="imagePreview" :src="imagePreview" alt="Image preview" class="mt-4 w-32 h-32 object-cover rounded-md border"/>
      </div>

      <div class="flex items-center justify-between mt-8">
        <button type="button" @click="router.go(-1)" class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
        <button type="submit" class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md hover:bg-cyan-600">Next</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
