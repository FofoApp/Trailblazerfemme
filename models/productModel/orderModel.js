const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', },
        orderItems: [
          {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            size: { type: String, required: true },
            color: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product', }
          },
        ],
        shippingAddress: {
          address: { type: String, required: true },
          city: { type: String, required: true },
          postalCode: { type: String, },
          country: { type: String, required: true },
        },

        paymentMethod: { type: String, default: "Stripe", },
        paymentIntentId: { type: String, default: "" },

        paymentResult: {
          id: { type: String },
          status: { type: String },
          update_time: { type: String },
        },

        taxPrice: { type: Number, required: true, default: 0 },
        shippingPrice: { type: Number, required: true, default: 0 },
        itemsPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 },
        isPaid: { type: Boolean, default: false, },
        paidAt: { type: Date,  },
        isDelivered: { type: Boolean,  default: false, },
        deliveredAt: { type: Date, },
        orderId: { type: String, },

      }, { timestamps: true, });


const Order = mongoose.model('Order', orderSchema);

module.exports = Order