const fs = require('fs');
const mongoose = require('mongoose');
const ProductModel = require('../../models/productModel/ProductModel');
const productCategoryModel = require('../../models/productModel/productCategoryModel');
const ReviewModel = require('../../models/productModel/productReviewModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const { productValidation } = require('./../../validations/productValidation');

exports.shop = async (req, res, next) => {

//GET REQUEST
//http://localhost:2000/api/product

    try {

        let productCategories = await productCategoryModel.find({}).select('-__v -createdAt -updatedAt');

        const query = [
            { $match: {} },
            { $lookup: { from: 'productcategories',  localField: "categoryId", foreignField: "_id", as: "productCategories" } },
            { $unwind: "$productCategories" },
            { $addFields: {
                sm: { price: "$sm", qty: "$smQ" },
                md: { price: "$md", qty: "$mdQ" },
                lg: { price: "$lg", qty: "$lgQ" },
                xl: { price: "$xl", qty: "$xlQ" },
                xxl: { price: "$xxl", qty: "$xxlQ" },
                xxxl: { price: "$xxxl", qty: "$xxxlQ" },
            } },
            
        ];

        if(req.query.search && req.query.search !== '') {
            query.push({
                $match: {
                    $or :[
                            { "name" : { $regex: '.*' + req.query.search + '.*',  $options: 'i' }  }
                         ]
                  },
            }, )
        }

        let total= await ProductModel.countDocuments(query);
		let page = (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page - 1) * perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });

        query.push(
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
                prices: 1,
                description: 1,
                colors: 1,
                quantity: 1,
                ratings: 1,
                reviews: 1,
                categoryId: 1,
                createdAt: 1,

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
        )

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, numberOfProducts:Math.ceil(total/perPage) }

        let products = await ProductModel.aggregate(query);

        return res.status(200).send({productCategories, products, paginationData});

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


  // const result = await productValidation(req.body);
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

        let product = await ProductModel.findOne({ name: name });
        if(product) return res.status(400).send({ error: "Product name already taken"});

        let urls = [];
        const files = req.files;
        if(files.length > 3) {
            return res.status(200).send({ error: "Maximum file upload cannot be more than 3"})
        }
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

        const productData = {  sm, md, lg, xl, xxl, xxxl,  smQ, mdQ, lgQ, xlQ, xxlQ, xxxlQ,
            colors, name, categoryId,  
            description, quantity,
            images
        };
        
        product = new ProductModel(productData);
        
        const uploadProduct  = await product.save();

        if(!uploadProduct) return res.status(400).send(savedProduct);

        return res.status(201).send(uploadProduct);




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

            // {  prices: { $push: { sm: "$sm", md: "$md", lg: "$lg", xl: "$xl", xxl: "$xxl", xxxl: "$xxxl" }  }   },

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
                prices: 1,
                description: 1,
                colors: 1,
                quantity: 1,
                ratings: 1,
                reviews: 1,
                categoryId: 1,
                createdAt: 1,

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
            { $lookup: { from: "reviews", localField: "_id", foreignField: "ratedProduct", as: "reviews"} },
            // { $unwind: "reviews" },
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
            prices: 1,
            description: 1,
            colors: 1,
            quantity: 1,
            reviews: 1,
            categoryId: 1,
            createdAt: 1,
         
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
            reviews: {
                "$map": {
                    "input": "$reviews",
                    "as": "review",
                    "in": {
                        "id": "$$review._id",
                        "rateCount": "$$review.rateCount",
                        "rateComment": "$$review.rateComment",
                        "ratedBy": "$$review.ratedBy",
                        "ratedProduct": "$$review.ratedProduct",
                        "createdAt": "$$review.createdAt"
                    }
                }
            }



         } },
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
        const { imageId } = req.body;

    try {
        
        // const result = await productValidation(req.body, true);

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid Id"});
        }
        // if(!mongoose.Types.ObjectId.isValid(imageId)) {
        //     return res.status(401).send({ error: "Invalid image Id"});
        // }

        let uploaderResponse;
        let product = await ProductModel.findById(productId)
      
        
        if(req.files && req.files.length > 0) {
            //Filter the public_id with imageId
            const public_id = product.images.filter((imagePublicId) => `${imagePublicId._id}` === imageId );
            if(!public_id) return res.status(400).send({ error: "Image not found"})

            //Delete Image from Cloudinary
            const publicId = public_id[0]?.publicId;
            uploaderResponse = await cloudinary.uploader.destroy(publicId);
            
            if(!uploaderResponse) return res.status(400).send({ error: "Unable to delete image"})
           
            //Delete Image string from database
            product = await ProductModel.findByIdAndUpdate(productId, {$pull: { images: {_id: mongoose.Types.ObjectId(imageId)} }  }, { new: true});
    
            let urls = [];

            const files = req.files;

            for (const file of files) {

            const { path } = file;

            // Upload Image to cloudinary
           
            uploaderResponse = await cloudinary.uploader.upload(path);
            const publicId =  uploaderResponse.public_id;
            const imgUrl = uploaderResponse.secure_url;
            const imgs = { publicId, imgUrl };
            urls.push(imgs);
            
            const images = urls;
            
            product = await ProductModel.findByIdAndUpdate(productId, {$push: { images: images }  }, { new: true});
            
            fs.unlinkSync(path);
                
            }
        }

        const updateProduct = await ProductModel.findByIdAndUpdate(productId, { $set: req.body }, { new: true } );

        if(!updateProduct) return res.status(400).send("Unable to update product");

        return res.status(200).send("Product updated successfully");

    } catch (error) {

        if(error.message === "Missing required parameter - public_id") {
            return res.status(400).send({ error: "Image id not found" })
        }

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
        const product = await ProductModel.findById(productId);

        const multiDelete = async (public_id) => {

            try {
                uploaderResponse = await cloudinary.uploader.destroy(public_id);       

                if(!uploaderResponse) return res.status(400).send({ error: "Unable to delete image"});

            } catch (error) {
                return res.status(500).send({ error: error.message });
            }

        }

        if(product && product.images && product.images.length > 0) {
            
        product.images.forEach((imagePublicId) => {
            const deletedImages = multiDelete(imagePublicId.publicId);
            if(!deletedImages) return res.status(400).send({ error: "Unable to unset images"})
        });

        //Delete all product images from cloudinary       
        await product.remove();

        }

        return res.status(200).send({ success: "Product deleted successfully" });

    } catch (error) {

        if(error.message === "Missing required parameter - public_id") {
            return res.status(400).send({ error: "Image id not found" });
        }

        return res.status(500).send({ error: error.message });
    }
}



//REVIEW SECTION
/**
 * 
 * 
 *
 * 
 *
 * 
 */


exports.productReview = async (req, res, next) => {
    const { ratedProduct } = req.body;
    const ratedBy = req.user.id;

    //http://localhost:2000/api/product/review

    /**
     * 
     * 
     * {
        "rateCount": 2,
        "rateComment": "My Second Review",
        "ratedProduct": "6305024315f75044124bab97"
        }

     */

    try {

        if(!mongoose.Types.ObjectId.isValid(ratedProduct)) {
            return res.status(400).send({ error: "Invalid Id"});
        }

        const reviewData = { ...req.body, ratedBy }

        const newReview = new ReviewModel(reviewData);

        const savedReview = await newReview.save();

        return res.status(200).send(savedReview);
        
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.getAllReviews = async (req, res, next) => {
    
    //http://localhost:2000/api/product/reviews
    // const { productId } = req.body;

    try {

        // if(!mongoose.Types.ObjectId.isValid(productId)) {
        //     return res.status(400).send({ error: "Invalid Id"});
        // }

        const query = [
            // { $match: { '_id': { '$eq': mongoose.Types.ObjectId(productId) }  } },
            { $lookup: { from: 'products',  localField: "ratedProduct", foreignField: "_id", as: "ratedProduct" } },
            { $unwind: "$ratedProduct" },

            { $lookup: { from: 'users',  localField: "ratedBy", foreignField: "_id", as: "ratedBy" } },
            { $unwind: "$ratedBy" },

            { $project: {
                _id : 0,
                ratingId: "$_id",
                rateCount:1,
                rateComment: 1,
                createdAt: 1,
                productId: "$ratedProduct._id",
                productName: "$ratedProduct.name",

                ratedById: "$ratedBy._id",
                ratedByUsername: "$ratedBy.fullname",
            }}

        ];

        const reviews = await ReviewModel.aggregate(query);
        if(!reviews) return res.status(400).send({ error: "No review(s)"})
        return res.status(200).send(reviews);
        
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}