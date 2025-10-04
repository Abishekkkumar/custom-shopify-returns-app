// backend/models/ReturnRequest.js

const mongoose = require('mongoose');

// This is the blueprint for our return requests in the database.
// It defines every field, its data type, and rules (like 'required').
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
        // The reason for returning this specific item
        reason: { type: String, default: 'Not specified' } 
      },
    ],
    request_type: {
      type: String,
      enum: ['return', 'exchange'], // Can only be one of these two values
      default: 'return',
    },
    exchange_for_variant_id: {
      type: Number,
      default: null,
    },
    // The URL for the uploaded image
    image_url: { 
      type: String,
      default: null
    },
    // The chosen refund mode
    refund_mode: {
      type: String,
      default: 'Not specified'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'exchange_processed'],
      default: 'pending',
    },
  },
  {
    // This option automatically adds `createdAt` and `updatedAt` fields
    // to our documents, which is very useful for tracking.
    timestamps: true,
  }
);

// We export the compiled model so our controllers can use it to interact
// with the 'returnrequests' collection in MongoDB.
module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);