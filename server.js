const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Order = require("./models/Order");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* MONGODB CONNECTION */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

/* HOME ROUTE */
app.get("/", (req,res)=>{
    res.send("🍛 Spice Garden Backend Running");
});

/* PLACE ORDER */
app.post("/order", async (req,res)=>{

    try{

        const newOrder = new Order({

            items:req.body.items,
            total:req.body.total,
            status:"Preparing"

        });

        await newOrder.save();

        res.json({
            success:true,
            message:"Order Placed Successfully",
            orderId:newOrder._id
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }

});

/* GET ALL ORDERS */
app.get("/orders", async (req,res)=>{

    try{

        const orders = await Order.find().sort({createdAt:-1});

        res.json(orders);

    }catch(err){

        res.status(500).json({
            success:false,
            message:"Error fetching orders"
        });

    }

});

/* TRACK ORDER */
/* TRACK ORDER */
app.get("/track/:id", async (req,res)=>{

    try{

        const order = await Order.findById(req.params.id);

        res.json(order);

    }catch(err){

        console.log(err);

        res.status(500).json({
            success:false
        });

    }

});

/* UPDATE STATUS */
app.put("/update-status/:id", async (req,res)=>{

    try{

        console.log("ID:", req.params.id);

        console.log("BODY:", req.body);

        const updatedOrder = await Order.findByIdAndUpdate(

            req.params.id,

            {
                status:req.body.status
            },

            {
                new:true
            }

        );

        console.log(updatedOrder);

        res.json({
            success:true,
            order:updatedOrder
        });

    }catch(err){

        console.log("ERROR:", err);

        res.status(500).json({
            success:false
        });

    }

});

const PORT = process.env.PORT || 5000;

/* START SERVER */
app.listen(PORT, ()=>{
    console.log(`🚀 Server running on port ${PORT}`);
});