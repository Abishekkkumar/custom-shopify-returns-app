<!-- frontend/src/components/Step2_SelectItems.vue -->
<script setup>
// defineProps is how a child component declares the data it expects to receive from its parent.
// In this case, it needs the full `order` object that we found in Step 1.
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

// defineEmits declares the custom events this component can send back up to its parent.
const emit = defineEmits(['itemSelected', 'goBack']);

// This function runs when a user clicks either the "Return" or "Exchange" button.
function selectAction(item, action) {
  // It then emits an 'itemSelected' event, sending the chosen item and the
  // action ('return' or 'exchange') up to the parent App.vue component.
  emit('itemSelected', { item, action });
}
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
    <div class="mb-8">
        <div class="flex items-center justify-center space-x-4 text-sm">
            <!-- Progress bar at the top -->
            <span class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500 text-white">1</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-cyan-500 text-cyan-500 font-bold">2</span>
            <span class="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400">3</span>
        </div>
        <div class="text-center mt-4">
            <h2 class="text-2xl font-semibold text-gray-800">Order {{ order.orderNumber }}</h2>
            <p class="text-sm text-gray-500">Ordered on {{ new Date(order.createdAt).toLocaleDateString() }}</p>
        </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-700">Returnable/Exchangeable Products</h3>
      
      <!-- We loop through each product ('line item') from the order data -->
      <div 
        v-for="item in order.lineItems" 
        :key="item.id" 
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center">
          <img :src="item.image" alt="Product Image" class="w-16 h-16 object-cover rounded-md mr-4 bg-gray-100" />
          <div>
            <p class="font-semibold text-gray-800">{{ item.title }}</p>
            <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
            <p class="text-sm text-gray-600">Price: ₹{{ item.price }}</p>
          </div>
        </div>
        
        <div class="flex flex-col space-y-2">
          <!-- The "Exchange" button calls our selectAction function with the item and the action 'exchange' -->
          <button 
            @click="selectAction(item, 'exchange')"
            class="px-4 py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors"
          >
            Exchange
          </button>
          <!-- The "Return" button calls our selectAction function with the item and the action 'return' -->
          <button 
            @click="selectAction(item, 'return')"
            class="px-4 py-2 bg-cyan-500 text-white text-sm font-semibold rounded-md hover:bg-cyan-600 transition-colors"
          >
            Return
          </button>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <!-- This emits a 'goBack' event to tell App.vue to go back to the first step -->
      <button @click="emit('goBack')" class="text-sm text-gray-600 hover:text-gray-900">
        &larr; Not your order? Go back
      </button>
    </div>
  </div>
</template>