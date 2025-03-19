 const transactionModel = require('../models/transaction');
 const axios = require('axios');
 const formattedDate= new Date().toLocaleString();

 exports.initializePayment = async (req, res)=>{
    try {
        const {email, name, amount} = req.body;
        if(!email || !name || !amount){
            return res.status(400).json({message: "All fields are required"})
        };
        const paymentData = {
            amount,
            customer:{
                name,
                email
            },
            currency: "NGN",
            reference: `TCA-AF-${Date.now()}`,
            
        };
        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData, {
            headers:{
                Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`
            }
        });
        const {data} = response?.data;
        const payment= new transactionModel({
            email,
            name,
            amount,
            reference: paymentData.reference,
            paymentDate: formattedDate
        });
        await payment.save();
        res.status(200).json({
            message: "payment initialized succesfully",
            data:{
                reference: data?.reference,
                checkout_url: data?.checkout_url
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})   
    }
 }
 exports.verifyPayment = async (req, res) => {    
    try {
        const { reference } = req.query;
        if (!reference) {
            return res.status(400).json({ message: "Reference is required" });
        }

        const response = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`
            }
        });

        const { data } = response?.data;
        const payment = await transactionModel.findOne({ reference });

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        if (data.status === "success") {
            payment.status = "success";
            await payment.save();
            return res.status(200).json({
                message: "Payment Verified Successfully",
                data: payment
            });
        } else {
            return res.status(400).json({
                message: "Payment Verification Failed",
                data: payment
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};