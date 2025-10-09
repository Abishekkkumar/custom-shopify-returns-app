// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// We now import all the "view" files for each step of the customer journey.
import OrderLookup from '../views/OrderLookup.vue';
import SelectItems from '../views/SelectItems.vue';
import ReturnDetails from '../views/ReturnDetails.vue';
import ConfirmRequest from '../views/ConfirmRequest.vue';
import SuccessPage from '../views/SuccessPage.vue';

// This is the "map" of our application's pages.
// Each object represents a unique URL and the component that should be displayed for it.
const routes = [
  {
    path: '/',
    name: 'OrderLookup',
    component: OrderLookup,
  },
  {
    path: '/order/:orderId', // The URL will contain the dynamic order ID
    name: 'SelectItems',
    component: SelectItems,
    props: true, // This passes the :orderId from the URL as a prop to the component
  },
  {
    path: '/request',
    name: 'ReturnDetails',
    component: ReturnDetails,
  },
  {
    path: '/confirm',
    name: 'ConfirmRequest',
    component: ConfirmRequest,
  },
  {
    path: '/success',
    name: 'SuccessPage',
    component: SuccessPage,
  },
];

const router = createRouter({
  // createWebHistory() enables clean URLs (e.g., /order/123) without the '#' symbol.
  history: createWebHistory(),
  routes, // a shorthand for `routes: routes`
});

export default router;
