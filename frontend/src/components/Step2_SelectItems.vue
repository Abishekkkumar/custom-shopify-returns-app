<!-- frontend/src/components/Step2_SelectItems.vue -->
<script setup>
// defineProps is used to declare what data this component expects from its parent.
// In this case, it's the `order` object we found in Step 1.
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

// defineEmits declares the custom events this component can send to its parent.
// We'll use this to tell App.vue which item and action the user selected.
const emit = defineEmits(['itemSelected', 'goBack']);

// This function is called when a user clicks "Return" or "Exchange".
function selectAction(item, action) {
  // It emits an event to the parent (App.vue) with the chosen item and action.
  emit('itemSelected', { item, action });
}
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-semibold text-gray-800">Order {{ order.orderNumber }}</h2>
      <p class="text-sm text-gray-500">Ordered on {{ new Date(order.createdAt).toLocaleDateString() }}</p>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-700">Returnable/Exchangeable Products</h3>
      
      <!-- We loop through each line item from the order data -->
      <div 
        v-for="item in order.lineItems" 
        :key="item.id" 
        class="flex items-center justify-between p-4 border border-gray-200 rounded-md"
      >
        <div class="flex items-center">
          <img :src="item.image || 'https://placehold.co/80x80/eee/ccc?text=No+Image'" alt="Product Image" class="w-16 h-16 object-cover rounded-md mr-4" />
          <div>
            <p class="font-semibold text-gray-800">{{ item.title }}</p>
            <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
            <p class="text-sm text-gray-600">Price: ₹{{ item.price }}</p>
          </div>
        </div>
        
        <div class="flex flex-col space-y-2">
          <!-- The "Exchange" button calls selectAction with the item and 'exchange' -->
          <button 
            @click="selectAction(item, 'exchange')"
            class="px-4 py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors"
          >
            Exchange
          </button>
          <!-- The "Return" button calls selectAction with the item and 'return' -->
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
      <button @click="emit('goBack')" class="text-sm text-gray-600 hover:text-gray-900">
        &larr; Not your order? Go back
      </button>
    </div>
  </div>
</template>