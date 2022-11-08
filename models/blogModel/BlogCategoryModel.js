const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, 

{ timestamps: true });


blogCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

blogCategorySchema.plugin(mongoosePaginate);
const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

module.exports = BlogCategory;