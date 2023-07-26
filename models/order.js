const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    paymentid: {
        type: String,
        required: true
    },
    orderid: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
