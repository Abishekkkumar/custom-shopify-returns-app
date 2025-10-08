// backend/models/ReturnRequest.js

const mongoose = require('mongoose');

const ReturnRequestSchema = new mongoose.Schema(
  {
    shopify_order_id: {
      type: Number,
      required: true,
    },
    shopify_order_number: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      required: true,
    },
    line_items: [
      {
        id: Number,
        title: String,
        quantity: Number,
        price: String,
        variantId: Number,
        productId: Number,
        reason: { type: String, default: 'Not specified' } 
      },
    ],
    request_type: {
      type: String,
      enum: ['return', 'exchange'],
      default: 'return',
    },
    exchange_for_variant_id: {
      type: Number,
      default: null,
    },
    image_url: { 
      type: String,
      default: null
    },
    refund_mode: {
      type: String,
      default: 'Not specified'
    },
    status: {
      type: String,
      // THIS IS THE FIX: We are adding 'requested' to the list of allowed values.
      enum: ['requested', 'pending', 'approved', 'rejected', 'exchange_processed'],
      default: 'requested', // We also make it the new default.
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);
