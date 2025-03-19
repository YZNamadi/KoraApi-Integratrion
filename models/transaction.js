const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
        trim: true
    },
    amount:{
        type:Number,
        required:true
    },
    reference:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:["pending","success","failed"],
        default: "pending"
    },
    paymentDate:{
        type:String,
        required:true
    }
}, {timestamps:true});

const Transaction = mongoose.model('transaction', transactionSchema); 
module.exports = Transaction;
