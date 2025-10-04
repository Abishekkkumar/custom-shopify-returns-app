// backend/controllers/returnsController.js
const shopifyService = require('../services/shopifyService');
const ReturnRequest = require('../models/ReturnRequest');

// ... (lookupOrder, createReturnRequest, getReturnRequests, approveReturnRequest functions remain the same) ...

const lookupOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;
    if (!orderNumber || !email) {
      return res.status(400).json({ success: false, error: 'Order Number and Email are required.' });
    }
    const order = await shopifyService.findOrderByNumberAndEmail(orderNumber, email);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found. Please check your details and try again.' });
    }

    const variantImageMap = {};
    if (order.images) {
      order.images.forEach(image => {
        if (image.variant_ids) {
          image.variant_ids.forEach(variant_id => {
            variantImageMap[variant_id] = image.src;
          });
        }
      });
    }

    const responseData = {
      orderId: order.id,
      orderNumber: order.name,
      createdAt: order.created_at,
      customer: order.customer,
      shippingAddress: order.shipping_address,
      email: order.email,
      lineItems: order.line_items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variant_id,
        productId: item.product_id,
        image: variantImageMap[item.variant_id] || 'https://placehold.co/100x100/eee/ccc?text=No+Image'
      })),
    };
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error in lookupOrder controller:', error.stack);
    res.status(500).json({ success: false, error: 'Server error while looking up order.' });
  }
};

const createReturnRequest = async (req, res) => {
  try {
    const { orderId, orderNumber, email, items, requestType, exchangeForVariantId, refundMode } = req.body;
    const parsedItems = JSON.parse(items);

    if (!orderId || !parsedItems || parsedItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Order ID and items are required.' });
    }

    const newReturnRequest = new ReturnRequest({
      shopify_order_id: orderId,
      shopify_order_number: orderNumber,
      customer_email: email,
      line_items: parsedItems,
      request_type: requestType,
      exchange_for_variant_id: exchangeForVariantId,
      refund_mode: refundMode,
      status: 'pending',
    });

    if (req.file) {
      newReturnRequest.image_url = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await newReturnRequest.save();
    res.status(201).json({ success: true, message: 'Request created successfully.' });
  } catch (error) {
    console.error('--- DETAILED CRASH REPORT in createReturnRequest ---');
    console.error(error.stack); 
    res.status(500).json({ success: false, error: 'Server error while creating request.' });
  }
};

const getReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error while fetching requests.' });
  }
};

const approveReturnRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const returnRequest = await ReturnRequest.findById(requestId);

    if (!returnRequest) {
      return res.status(404).json({ success: false, error: 'Return request not found.' });
    }

    if (returnRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This request has already been processed.' });
    }

    const shopifyOrder = await shopifyService.findOrderByNumberAndEmail(
      returnRequest.shopify_order_number,
      returnRequest.customer_email
    );
    if (!shopifyOrder) {
      throw new Error('Original Shopify order could not be found to process request.');
    }

    if (returnRequest.request_type === 'return') {
      const lineItemsToRefund = returnRequest.line_items.map(item => ({
        line_item_id: item.id,
        quantity: item.quantity,
      }));
      await shopifyService.createRefund(
        returnRequest.shopify_order_id,
        lineItemsToRefund,
        shopifyOrder.currency
      );
      returnRequest.status = 'approved';
      await returnRequest.save();
      res.status(200).json({ success: true, message: 'Return approved and refund processed successfully.' });
    } else if (returnRequest.request_type === 'exchange') {
      if (!shopifyOrder.customer || !shopifyOrder.customer.id) {
          throw new Error('Customer information is missing from the original order.');
      }
      await shopifyService.createDraftOrderForExchange(
        shopifyOrder.customer.id,
        returnRequest.exchange_for_variant_id,
        returnRequest.shopify_order_number
      );
      returnRequest.status = 'exchange_processed';
      await returnRequest.save();
      res.status(200).json({ success: true, message: 'Exchange approved and draft order created successfully.' });
    }
  } catch (error) {
    const errorMessage = error.message?.toLowerCase();
    if (errorMessage && errorMessage.includes('cannot refund more items')) {
      return res.status(400).json({ success: false, error: 'This request has already been processed.' });
    }
    res.status(500).json({ success: false, error: 'Server error while approving request.' });
  }
};

/**
 * @desc    Rejects a return request and updates its status
 * @route   POST /api/returns/admin/requests/:id/reject
 * @access  Private
 */
const rejectReturnRequest = async (req, res) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.id);

    if (!returnRequest) {
      return res.status(404).json({ success: false, error: 'Return request not found.' });
    }

    if (returnRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This request has already been processed.' });
    }

    returnRequest.status = 'rejected';
    await returnRequest.save();

    res.status(200).json({ success: true, message: 'Request has been rejected.' });
  } catch (error) {
    console.error('Error in rejectReturnRequest controller:', error);
    res.status(500).json({ success: false, error: 'Server error while rejecting request.' });
  }
};

module.exports = {
  lookupOrder,
  createReturnRequest,
  getReturnRequests,
  approveReturnRequest,
  rejectReturnRequest, // <-- EXPORT THE NEW FUNCTION
};
