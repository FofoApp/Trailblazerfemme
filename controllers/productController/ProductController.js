
const mongoose = require('mongoose');
const ProductModel = require('../../models/productModel/ProductModel');
const productCategoryModel = require('../../models/productModel/productCategoryModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const { productValidation } = require('./../../validations/productValidation');

exports.shop = async (req, res, next) => {

//GET REQUEST
//http://localhost:2000/api/product


    try {

        let productCategories = await productCategoryModel.find({}).select('-__v -createdAt -updatedAt');

        // const test = await productCategoryModel.aggregate([
        //     { $match: {} },
        //     { $addFields: { price_and_qty: { price: "$name", qty: "$description" } } }
        // ]);
        // return res.status(200).send(test)

        const query = [
            { $lookup: { from: 'productcategories',  localField: "categoryId", foreignField: "_id", as: "productCategories" } },
            { $unwind: "$productCategories" },
            { $project: { _id: 0, id: "$_id", name:1, description:1 } }
        ];

        let products = await ProductModel.aggregate(query);
        return res.status(200).send({productCategories, products});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.createNewProduct = async (req, res, next) => {


    //NOTE:: VALIDATE USER INPUTS BEFORE PROCESSING
    //POST REQUEST
    //http://localhost:2000/api/product/create

    /*

    {
    "name": "Wrist-Watch",
    "description": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which able",
    "price": [{ "s": 2000,  "m": 3000, "l": 4000, "xl": 5000, "xxl": 6000, "xxxl": 7000 } ],
    "colour": ["Yellow", "Blue"],

    "images": [{  "image1": "default.jpg",  "image2": "default.jpg",  "image3": "default.jpg" }],
    "quantity": 5,
    "categoryId": "628cbc4949fca217cbf8962e"

    }

    name: "",
    description: "",
    colour: "",

    priceS: "",
    priceM: "",
    priceL: "",
    priceXL: "",
    priceXXL: "",
    priceXXXL: "",

    image1: "",
    image2: "",
    image3: "",
    quantity: "",
    categoryId: ""

    */


    let { name, quantity, categoryId, colors, description, 
        sm = 0, md = 0, lg = 0, xl = 0, xxl = 0, xxxl = 0, 
        smQ = 0, mdQ = 0, lgQ = 0, xlQ = 0, xxlQ = 0, xxxlQ = 0        
    } = req.body;

    sm = +sm;
    md = +md;
    lg = +lg;
    xl = +xl;
    xxl = +xxl;
    xxxl = +xxxl;

    smQ = +smQ;
    mdQ = +mdQ;
    lgQ = +lgQ;
    xlQ = +xlQ;
    xxlQ = +xxlQ;
    xxxlQ = +xxxlQ;

    quantity = +quantity;


    colors = colors.split(",");
   
    try {

        let urls = [];
        const files = req.files;
        for (const file of files) {
        const { path } = file;
         // Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(path);
        const publicId =  uploaderResponse.public_id;
        const imgUrl = uploaderResponse.secure_url;
        const imgs = { publicId, imgUrl};
        urls.push(imgs);

        }

        const images = urls;

        // const productData = { priceList, images, colors, name, categoryId,  description, totalQuantity  };
        const productData = {  sm, md, lg, xl, xxl, xxxl,  smQ, mdQ, lgQ, xlQ, xxlQ, xxxlQ,
            colors, name, categoryId,  
            description, quantity,
            images
        };
        
        const product = new ProductModel(productData);
     
        const uploadProduct  = await product.save();

        if(!uploadProduct) return res.status(400).send(savedProduct);

        return res.status(201).send(uploadProduct);

        // const result = await productValidation(req.body);
        // const createProduct = new ProductModel(result);
        // const savedProduct = await createProduct.save();
        // return res.status(201).send(savedProduct);


    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message })
    }


}

exports.listProducts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/lists
    try {

        const query = [
            { $match: {} },

            // { $addFields: { $addFields: { sm: { "$" }  } }  },
            // { $unwind: "$images" },

            { $addFields: { 
                sm: { price: "$sm", qty: "$smQ" },
                md: { price: "$md", qty: "$mdQ" },
                lg: { price: "$lg", qty: "$lgQ" },
                xl: { price: "$xl", qty: "$xlQ" },
                xxl: { price: "$xxl", qty: "$xxlQ" },
                xxxl: { price: "$xxxl", qty: "$xxxlQ" },
            } },

            { $project: { 
                _id : 0, 
                id: "$_id",
                name: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 1,
                xxl: 1,
                xxxl: 1,
                description:1,
                colors:1,
                images:1, 
                quantity: 1,
                ratings:1,
                reviews:1,
                categoryId:1,
                createdAt:1,
                // sm: 1, 
                // md: 1, 
                // lg: 1, 
                // xl: 1, 
                // xxl: 1, 
                // xxxl: 1,  
                // smQ: 1, 
                // mdQ: 1, 
                // lgQ: 1, 
                // xlQ: 1, 
                // xxlQ: 1, 
                // xxxlQ: 1,
             
                images: { 
                    "$map": {
                        "input": "$images",
                        "as": "image", 
                        "in": {
                            "id": "$$image._id",
                            "imgUrl": "$$image.imgUrl",
                        }
                    }
                },
             } },

            
        ]

        const products = await ProductModel.aggregate(query);

        if(!products) {
            return res.status(200).send({ error: "No product found"});
        }

        return res.status(200).send(products);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.getProductsByCategory = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/categoryId
    //http://localhost:2000/api/product/628cbc4949fca217cbf8962e
    const { categoryId } = req.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).send({ error: "Invalid Id"});
        }
        const products = await ProductModel.find({categoryId: categoryId });

        if(!products) {
            return res.status(404).send({ error: "No product found" });
        }
        return res.status(200).send(products);
    } catch (error) {
        
        return res.status(500).send({ error: error.message })
    }
}

exports.getProductById = async (req, res, next) => {
    //VERIFY IF ID IS CORRECT
    //GET REQUEST
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/product

    const { productId } = req.params;
    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid product parameter"});
        }

        const query = [
            { $match: { _id: mongoose.Types.ObjectId(productId) } },
            { $project: { "id": "_id", name: 1, description: 1, 
            price:1,
            colour:1, images:1, quantity: 1, ratings: 1, reviews:1, 
            categoryId:1, _id:0
        } }
        ]

        const product = await ProductModel.aggregate(query);

        return res.status(200).send(product);

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

exports.updateProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //PATCH REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/update

        const { productId } = req.params;
    try {
        
        const result = await productValidation(req.body, true);

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid Id"});
        }
        const updateProduct = await ProductModel.findByIdAndUpdate({ _id: productId }, {$set: req.body }, { new: true } );

        if(!updateProduct) return res.status(400).send("Unable to update product");

        return res.status(200).send("Product updated successfully");

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.deleteProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //DELETE REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/delete

        const { productId } = req.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid product parameter"});
        }
        await ProductModel.findByIdAndUpdate({ _id: productId }, {$set: req.body }, { new: true } );

        return res.status(200).send({success: "Product deleted successfully"});
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

