Custom Shopify Returns & Exchanges Portal
This is a full-stack web application that creates a custom, multi-step returns and exchanges portal for a Shopify store, inspired by professional apps like Returns Prime. The project is built with a Node.js/Express backend, MongoDB database, and two separate Vue.js frontends for the customer portal and the admin dashboard.


Features
Customer Portal (Frontend)
Multi-Step Workflow: A clean, step-by-step UI that guides the customer through the returns process, designed to match the provided UI screenshots.

Order Lookup: Customers can securely find their order using their order number and email address.

Return or Exchange Selection: Customers can choose whether to return an item for a refund or exchange it for a different product.

Detailed Information Gathering:

Customers must select a Reason for the return from a dropdown menu.

An optional image upload is available for documenting damaged items.

For returns, customers can select a Refund Method (e.g., Store Credit).

Address Confirmation: A final confirmation step shows a summary of the request before submission.

Admin Dashboard (Admin Frontend)
Separate Views: The dashboard is split into "Returns" and "Exchanges" tabs for clear organization and management.

Request List: Each tab displays a table of all pending requests, showing key details like product, customer, and order number.

Detailed Modal View: Clicking on any request opens a detailed view with all information, including the reason, refund mode, customer info, and any uploaded images.

Approve & Reject: The detail view contains "Approve" and "Reject" buttons to manage the request.

Automated Shopify Actions:

Approving a "Return" automatically processes a refund via the Shopify API.

Approving an "Exchange" automatically creates a new draft order in Shopify for the new item.

Tech Stack
Backend: Node.js, Express.js, MongoDB with Mongoose

Frontend: Vue.js (Vue 3), Axios, Tailwind CSS

API Integration: Official Shopify Admin REST API

File Uploads: Multer for handling image uploads on the backend.

Setup & Installation
To run this project locally, you will need to have Node.js and MongoDB installed.

Backend Setup
Navigate to the backend directory:

cd backend

Install the required dependencies:

npm install

Create a .env file in the backend folder and add the following variables:

MONGO_URI=your_mongodb_connection_string
SHOPIFY_SHOP_URL=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=your_shpat_admin_access_token
PORT=5002

Start the backend server:

npm run dev

Frontend Setup (Customer & Admin)
Navigate to the frontend or admin-frontend directory:

cd frontend
# or
cd admin-frontend

Install dependencies:

npm install

Start the frontend development server (it will run on localhost:5173 for the customer portal and localhost:5174 for the admin dashboard):

npm run dev
