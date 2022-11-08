const mongoose = require('mongoose');
const createError = require('http-errors');

const ProductModel = require('./../../models/productModel/ProductModel');

exports.createNewProduct =  async (req, res, next) => {

    const urls = [];

    let publicIdArray = [];

    //NOTE:: VALIDATE USER INPUTS BEFORE PROCESSING
    //POST REQUEST
    //http://localhost:2000/api/product/create

    /*
{
    "name": "Wrist-Watch",
    "description": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which able",
    "price": [{
        "s": 2000,  "m": 3000, "l": 4000, "xl": 5000, "xxl": 6000, "xxxl": 7000 } ],
    "colour": ["Yellow", "Blue"],
    "images": [{  "image1": "default.jpg",  "image2": "default.jpg",  "image3": "default.jpg" }],
    "quantity": 5,
    "categoryId": "628cbc4949fca217cbf8962e"
}
    */

try {
    const result = await productValidation(req.body);

    if(req.method === 'POST' && req?.files) {
        const files = req.files;
        
        for(const file of files) {
            const { path } = file;

            //Upload NEW DOCUMENTS to cloudinary
            const uploaderResponse = await cloudinary.uploader.upload(path);

            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(404).send({ message: "Unable to upload, please try again"});
            }

            urls.push(uploaderResponse);
           
        }
    }

    const createData = {
        ...result,
        images: [
            { "image1": urls[0] ? urls[0].secure_url : null, "image1PublicId": urls[0] ? urls[0].public_id : null },
            { "image2": urls[1] ? urls[1].secure_url : null, "image1PublicId": urls[1] ? urls[1].public_id : null },
            { "image3": urls[2] ? urls[2].secure_url : null, "image1PublicId": urls[2] ? urls[2].public_id : null },
        ]
    }

    const createProduct = new ProductModel(createData);

    const savedProduct = await createProduct.save();

    return res.status(200).send({ message: savedProduct });


} catch (error) {
    return res.status(500).send({ message: error.message })
}


}
  

exports.listProducts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/lists
    let { page, size } = req.query;

    if(!page) page = 1;
    if(!size) size = 10;

    page = parseInt(page);
    size = parseInt(size);

    const limit = size;
    const skip = (page - 1) * size;

    try {
        const products = await ProductModel.find({})
        .limit(limit)
        .skip(skip)

        if(!products) {
            return res.status(200).send({message: "No product found"});
        }
        return res.status(200).send(products);
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const getProductById = async (req, res, next) => {
    //VERIFY IF ID IS CORRECT
    //GET REQUEST
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/product

    const { productId } = req.params;
    
    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ message: "Invalid product parameter"});
        }

        const product = await ProductModel.findOne({ _id: productId });
        return res.status(200).send(product);

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.updateProductById = async (req, res, next) => {
    //VERIFY IF ID IS CORRECT
    //PATCH REQUEST
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/update

    const { productId } = req.params;
try {
    
    const result = await productValidation(req.body, true);

    // const result = registerSchema(dataToUpdate);

    if(!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(401).send({ message: "Invalid product parameter"});
    }
    const updateProduct = await ProductModel.findByIdAndUpdate({ _id: productId }, {$set: { ...req.body} }, { new: true } );

    return res.status(200).send({message: "Product updated successfully", updateProduct});
} catch (error) {
    return res.status(500).send({ message: error.message })
}
}

exports.deleteProductById = async (req, res, next) => {
    //VERIFY IF ID IS CORRECT
    //DELETE REQUEST
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/delete

    const { productId } = req.params;

try {

    if(!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(401).send({ message: "Invalid product parameter"});
    }
    await ProductModel.findByIdAndUpdate(productId);

    return res.status(200).send({message: "Product deleted successfully"});
} catch (error) {
    return res.status(500).send({ message: error.message })
}
}