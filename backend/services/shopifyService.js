// backend/services/shopifyService.js
const axios = require('axios');

// We create a pre-configured axios instance to easily communicate with Shopify.
const shopifyApi = axios.create({
  baseURL: `https://${process.env.SHOPIFY_SHOP_URL}/admin/api/2025-07`,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
    'Content-Type': 'application/json',
  },
});

/**
 * Finds a Shopify order by its order number and email.
 * This is used for the customer's initial lookup.
 */
const findOrderByNumberAndEmail = async (orderNumber, email) => {
  try {
    const formattedOrderNumber = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
    // We fetch a list of recent orders and then find the one that matches.
    const response = await shopifyApi.get(`/orders.json?status=any&limit=250`);
    const orders = response.data.orders;
    const foundOrder = orders.find(order => 
        order.name === formattedOrderNumber && 
        order.email && 
        order.email.toLowerCase() === email.toLowerCase()
    );
    return foundOrder;
  } catch (error) {
    console.error('Error fetching from Shopify API:', error.response ? error.response.data : error.message);
    throw new Error('Could not communicate with Shopify API.');
  }
};

/**
 * Creates a refund in Shopify for a specific order.
 * This is called when an admin approves a 'return' request.
 */
const createRefund = async (orderId, lineItemsToRefund, currency) => {
  try {
    const refundPayload = {
      refund: {
        currency: currency,
        notify: true, // This sends a notification email to the customer
        refund_line_items: lineItemsToRefund,
      },
    };
    const response = await shopifyApi.post(`/orders/${orderId}/refunds.json`, refundPayload);
    return response.data.refund;
  } catch (error) {
    const errorData = error.response ? error.response.data : { errors: error.message };
    const errorMessage = JSON.stringify(errorData.errors);
    throw new Error(errorMessage);
  }
};

/**
 * Creates a new draft order in Shopify for an exchange.
 * This is called when an admin approves an 'exchange' request.
 */
const createDraftOrderForExchange = async (customerId, variantId, originalOrderNumber) => {
    try {
        const draftOrderPayload = {
            draft_order: {
                line_items: [{
                    variant_id: variantId,
                    quantity: 1,
                    // We apply a 100% discount to make the exchange item free.
                    applied_discount: {
                        title: "Exchange Item",
                        description: `Even exchange for item from order ${originalOrderNumber}`,
                        value: "100",
                        value_type: "percentage"
                    }
                }],
                customer: { id: customerId },
                note: `Automated exchange for a return from order ${originalOrderNumber}.`,
                use_customer_default_address: true,
            }
        };
        const response = await shopifyApi.post('/draft_orders.json', draftOrderPayload);
        return response.data.draft_order;
    } catch (error) {
        const errorData = error.response ? error.response.data : { errors: error.message };
        const errorMessage = JSON.stringify(errorData.errors);
        throw new Error(`Failed to create draft order in Shopify: ${errorMessage}`);
    }
};

module.exports = {
  findOrderByNumberAndEmail,
  createRefund,
  createDraftOrderForExchange,
};
