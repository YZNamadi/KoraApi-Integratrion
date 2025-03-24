// controllers/fincraController.js
const Payment = require('../models/payment');
const axios = require('axios');
const formattedDate = new Date().toLocaleString();

exports.initializePayment = async (req, res) => {
  try {
    const { email, name, amount, phoneNumber, feeBearer } = req.body;
    if (!email || !name || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate a unique transaction reference
    const reference = `FINC-${Date.now()}`;

    // Build the payload for Fincra's API
    const paymentData = {
      amount,
      currency: "NGN",
      customer: {
        name,
        email,
        phoneNumber: phoneNumber || ""
      },
      feeBearer: feeBearer || "business",
      reference
    };

    // Construct the full endpoint URL
    let baseUrl = process.env.FINCRAS_BASE_URL;
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const endpoint = `${baseUrl}/checkout/payments`;
    console.log("Initializing payment at endpoint:", endpoint);

    // Call Fincras's payment initialization endpoint
    const response = await axios.post(endpoint, paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.FINCRAS_SECRET_KEY,
        'x-pub-key': process.env.FINCRAS_PUBLIC_KEY
      }
    });
      // console.log("Response from Fincras:", response.data);
    // Extract data returned by Fincras
    const { data } = response?.data;

    // Save the transaction in the database
    const payment = new Payment({
      amount,
      currency: paymentData.currency,
      customer: paymentData.customer,
      feeBearer: paymentData.feeBearer,
      reference,
      // redirectUrl: "", // Removed redirectUrl from payload
      status: "initiated",
      createdAt: formattedDate,
      updatedAt: formattedDate
    });
    await payment.save();

    return res.status(200).json({
      message: "Payment initialized successfully",
      data: {
        reference: data?.reference,
        checkout_url: data?.link
      }
    });
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    return res.status(500).json({ message: error.message });
    
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ message: "Reference is required" });
    }
   
    const endpoint = `${process.env.FINCRAS_BASE_URL}/checkout/payments/merchant-reference/${reference}`;
    console.log("Verifying payment at endpoint:", endpoint);

    const response = await axios.get(endpoint, {
      headers: {
        'api-key': process.env.FINCRAS_SECRET_KEY,
        'x-business-id': process.env.FINCRAS_BUSINESS_ID
      }
    });

    const { data } = response?.data;
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (data.status === "success") {
      payment.status = "completed";
      await payment.save();
      return res.status(200).json({
        message: "Payment verified successfully",
        data: payment
      });
    } else {
      return res.status(400).json({
        message: "Payment verification failed",
        data: payment
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    const { reference, status } = req.body;
    if (reference && status) {
      await Payment.findOneAndUpdate({ reference }, { status, updatedAt: new Date() });
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook handling error:', error.message);
    return res.sendStatus(500);
  }
};
