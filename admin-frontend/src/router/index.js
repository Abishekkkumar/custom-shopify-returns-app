// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// We now import the view components we just created.
import RequestsList from '../views/RequestsList.vue';
import RequestDetail from '../views/RequestDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    // Redirect the base URL ('/') to the '/all-requests' page by default.
    redirect: '/all-requests',
  },
  {
    path: '/all-requests',
    name: 'AllRequests',
    component: RequestsList,
    // This prop tells the RequestsList component to show ALL request types.
    props: { requestType: 'all' },
  },
  {
    path: '/returns',
    name: 'Returns',
    component: RequestsList, // Use the RequestsList component for this URL.
    // This prop tells the component to show only 'return' requests.
    props: { requestType: 'return' },
  },
  {
    path: '/exchanges',
    name: 'Exchanges',
    component: RequestsList, // Reuse the same component for this URL.
    // This prop tells the component to show only 'exchange' requests.
    props: { requestType: 'exchange' },
  },
  {
    path: '/requests/:id', // The ':id' is a dynamic parameter for the request ID.
    name: 'RequestDetail',
    component: RequestDetail, // Use the RequestDetail component for this URL.
    // This tells the router to automatically pass the ':id' from the URL as a prop
    // to the RequestDetail component.
    props: true,
  },
];

const router = createRouter({
  // createWebHistory() enables clean URLs without the '#' symbol.
  history: createWebHistory(),
  routes, // a shorthand for `routes: routes`
});

export default router;
