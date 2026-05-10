const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    items:[
        {
            name:String,
            price:Number,
            qty:Number
        }
    ],

    total:Number,

    status:{
        type:String,
        default:"Preparing"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model("Order", orderSchema);