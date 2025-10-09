<script setup>
// This view is for Step 2
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const order = ref(null);

// When this page loads, it retrieves the order data that Step 1 saved in session storage.
onMounted(() => {
  const storedOrder = sessionStorage.getItem('orderData');
  if (storedOrder) {
    order.value = JSON.parse(storedOrder);
  } else {
    // If for some reason the data is missing, it sends the user back to the start.
    router.push({ name: 'OrderLookup' });
  }
});

// When an action is selected, this function saves the choice to session storage
// and uses the router to navigate to the next step ('/request').
function selectAction(item, action) {
  const request = { items: [item], requestType: action };
  sessionStorage.setItem('returnRequest', JSON.stringify(request));
  router.push({ name: 'ReturnDetails' });
}
</script>

<template>
    <div v-if="order" class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-gray-800">Order {{ order.orderNumber }}</h2>
            <p class="text-sm text-gray-500">Ordered on {{ new Date(order.createdAt).toLocaleDateString() }}</p>
        </div>
        <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-700">Returnable/Exchangeable Products</h3>
            <div v-for="item in order.lineItems" :key="item.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center">
                    <img :src="item.image" alt="Product" class="w-16 h-16 rounded-md mr-4 bg-gray-100 object-cover" />
                    <div>
                        <p class="font-semibold text-gray-800">{{ item.title }}</p>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button @click="selectAction(item, 'exchange')" class="px-4 py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800">Exchange</button>
                    <button @click="selectAction(item, 'return')" class="px-4 py-2 bg-cyan-500 text-white text-sm font-semibold rounded-md hover:bg-cyan-600">Return</button>
                </div>
            </div>
        </div>
        <div class="mt-8 text-center">
            <button @click="router.push({ name: 'OrderLookup' })" class="text-sm text-gray-600 hover:text-gray-900">
                &larr; Not your order? Go back
            </button>
        </div>
    </div>
</template>

