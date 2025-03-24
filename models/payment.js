// models/payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // Payment amount in smallest currency unit
  currency: { type: String, default: 'NGN' }, // e.g., NGN, USD
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String }
  },
  feeBearer: { type: String, enum: ['business', 'customer'], default: 'customer' },
  reference: { type: String, required: true, unique: true }, // Your internal reference or Fincras reference
//   redirectUrl: { type: String }, // URL where user is redirected after payment
  status: { 
    type: String, 
    enum: ['initiated', 'pending', 'completed', 'failed'], 
    default: 'initiated' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the `updatedAt` field
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
