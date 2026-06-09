import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                min: 0,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    shippingAddress: {
        street: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true},
        pincode: {type: String, required: true},
        phone: {type: String, required: true},
    },  

    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },

    paymentId: {
        type: String
    }

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;