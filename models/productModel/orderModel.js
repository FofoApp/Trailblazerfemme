const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');


const orderSchema = new mongoose.Schema({
    
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', },
        userEmail: { type: String, trim: true, default: "" },
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
          postalCode: { type: String, default: "" },
          country: { type: String, required: true },
        },

        paymentMethod: { type: String, default: "Stripe", },
        paymentIntentId: { type: String, default: "" },

        paymentResult: {
          paymentIntentId: { type: String, default: "" },
          status: { type: String, default: "" },
          update_time: { type: String, default: "" },
        },

        taxPrice: { type: Number, required: true, default: 0 },
        shippingPrice: { type: Number, required: true, default: 0 },
        itemsPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 },
        isPaid: { type: Boolean, default: false, },
        paidAt: { type: Date, default: Date.now() },
        isDelivered: { type: Boolean,  default: false, },
        deliveryStatus: { type: String,  default: "pending" },
        deliveredAt: { type: Date, },
        orderId: { type: String,  default: "" },

      }, { timestamps: true, });


      orderSchema.options.toJSON = {
      // virtuals: true,
      transform: function(doc, ret, options){
        
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;

          return ret;
      }
  };

orderSchema.plugin(mongoosePaginate);
const Order = mongoose.model('Order', orderSchema);


module.exports = Order