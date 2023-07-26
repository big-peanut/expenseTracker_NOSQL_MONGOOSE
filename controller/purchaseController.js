const Razorpay = require('razorpay');
const Order = require('../models/order');
const dotenv = require('dotenv');

dotenv.config();

const purchasepremium = async (req, res, next) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const amount = 9900;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            const newOrder = new Order({
                paymentid: order.id,
                orderid: order.id,
                status: 'PENDING',
                userId: req.user._id // Assuming you have the user's _id available in req.user
            });

            const savedOrder = await newOrder.save();

            return res.status(201).json({ order: savedOrder, key_id: rzp.key_id });
        });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: "Something went wrong", error: err });
    }
};

const updatepurchasepremium = async (req, res, next) => {
    try {
        const { payment_id, orderid } = req.body;
        const order = await Order.findOne({ orderid: orderid });

        order.paymentid = payment_id;
        order.status = 'SUCCESSFUL';
        await order.save();

        req.user.ispremium = true;
        await req.user.save();

        return res.status(202).json({ success: true, message: "Transaction Successful" });
    } catch (err) {
        console.log(err);
        res.status(403).json({ error: err, message: 'Something went wrong' });
    }
};


module.exports = {
    purchasepremium,
    updatepurchasepremium
};
