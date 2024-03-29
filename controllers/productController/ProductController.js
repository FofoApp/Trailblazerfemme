const fs = require('fs');
const mongoose = require('mongoose');
const ProductModel = require('../../models/productModel/ProductModel');
const productCategoryModel = require('../../models/productModel/productCategoryModel');
const ProductReview = require('../../models/productModel/productReviewModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const { productValidation } = require('./../../validations/productValidation');
const ProductCategory = require('../../models/productModel/productCategoryModel');
const { truncate } = require('fs/promises');
const Product = require('../../models/productModel/ProductModel');
const Order = require('../../models/productModel/orderModel');

exports.shop = async (req, res, next) => {

//GET REQUEST
//http://localhost:2000/api/product?search=gucci

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
                likes:1,
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

    */

        const prodVal = [
            {
                size: "MD",
                price: "234",
                qty: "3",
                color: "black",
            }
        ];

        // Check if product variation was passed through request body object
        if(req?.body?.product_variation) {

        // convert product variation to javascript object
        let variationArray = JSON.parse(req?.body?.product_variation)

        if(!Array.isArray(variationArray)) {

        res.status(400).json({ status: "failed", error: "Please provide product variation"});
        return;
        
        }

        // Loop through the array and cast price and qty to integer
        const variation = variationArray.map((item) => ({ ...item, price: Number(item.price), qty: Number(item?.qty) }) );

        // set req.body.product_variation to the new Array
        req.body.product_variation = variation;
    }

    let { name, category, description, product_variation = [] } = req.body;

    try {

        let product_images = [];

        const files = req.files;

        if(!files) {
            return res.status(400).json({ error: "Upload product images"});
        }

        if(files.length > 3) {
            return res.status(400).json({ status: 'failed', error: "Maximum file upload cannot be more than 3" });
        }

        const product_category = await ProductCategory.findById(category)

        if(!product_category) {
            return res.status(400).send({ status: 'failed', error: "Product category not found"});
        }

        let product = await ProductModel.findOne({ name });

        if(product) {
            return res.status(400).send({ status: 'failed', error: "Product name already taken"});
        }

        for (const file of files) {
        const { path } = file;
         // Upload Image to cloudinary
        const { public_id, secure_url  } = await cloudinary.uploader.upload(path);

        product_images.push({ public_id, secure_url });

        }

        const product_data = {
            name,
            category,
            description,
            product_images,
            product_variation,
        }

        
        const new_product = new ProductModel(product_data);

        const savedProduct  = await new_product.save();

        if(!savedProduct) return res.status(400).send({ status: 'failed', success: false, error: "Unable to create product"});

        product_category.products.addToSet(savedProduct._id)

        await product_category.save()

        return res.status(201).send({ status: 'failed', success: true, product: savedProduct});

    } catch (error) {
        // console.log(error)
        return res.status(500).send({ status: 'failed', error: error.message })
    }


}

exports.listProducts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/lists?search=gucci

    const DEFAULT_PAGE = 1;
    const DEFAULT_SIZE = 5;

    let { page = DEFAULT_PAGE, size = DEFAULT_SIZE } = req.query;

    page = Number(page);
    size = Number(size);

    const limit = size;
    const skip = (page - 1) * size;


    try {

        const search = req.query.search 
            ? { name: { $regex: '.*' + req.query.search + ".*", $options: 'i' } } 
            : {}

        const product_category = await productCategoryModel.find({})
                                                          .populate({
                                                            path: 'products',
                                                            model: "Product",
                                                            select: "name product_images "
                                                          })
        
        const products2 = await ProductModel.paginate(search, {
            page, 
            limit,
            select: '-top_sellers',
            populate: {
                path: 'reviews',
                model: "ProductReview",
                select: "comment rating",
                populate: {
                    path: 'ratedBy',
                    model: "User",
                    select: "id fullname profileImage ",
                }

                // rating: { type: Number, required: true, },
                // comment: { type: String, required: true},
                // ratedBy: { type: ObjectId, ref: 'User', required: true },
                // name: { type: String, required: true },
            }
        })

        // TOP SELLERS

        const top_sellers = await ProductModel.paginate(search, {
            page, 
            limit,
            select: '-top_sellers',
            sort: { createdAt: -1 },
        })



        // const products2 = await ProductModel.paginate(search)

        // const products = await ProductModel.find({}).populate('category', "name _id")

        if(!products2 || products2?.docs?.length === 0) {
            return res.status(200).json({ error: "No product found", products: [] });
        }

        return res.status(200).json({ 
            success: true,
            categories: product_category,
            products: products2,
            top_sellers
        });
        
    } catch (error) {
        return res.status(500).send({ error: error?.message });
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
        const products = await ProductModel.find({ categoryId });

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
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/get

    const { productId } = req.params;
    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid product parameter"});
        }

        //REVIEWS

        const reviews = await ProductReview.paginate({ 
            product: productId,
        }, 
        { select: "-__v -updatedAt -product" } );


        //PRODUCTS YOUR MAY LIKE
        const product_you_may_like = await ProductModel.paginate({
            $sample: { size: 10 }
        },  { select: "-__v -updatedAt -reviews -likes -category " })

        const product = await ProductModel.findById(productId).select("-reviews -likes -category -updatedAt");

        return res.status(200).send({ product, reviews, product_you_may_like, });
     

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

exports.updateProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //PATCH REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/update

        const { productId } = req.params;

        if(req.body.product_variation) {
            req.body.product_variation = JSON.parse(req.body.product_variation)
        }

        let {  name, qty = 0, price = 0, size, category, color, description, imageIds, product_variation = [] } = req.body;

        if(imageIds) {
            imageIds = imageIds.split(',')
        }

    try {
        
        // const result = await productValidation(req.body, true);

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ error: "Invalid Id"});
        }

        // if(!mongoose.Types.ObjectId.isValid(imageId)) {
        //     return res.status(401).send({ error: "Invalid image Id"});
        // }

        const product_data = {}
        const product_object = {}
        const product_variation = []
        let product_images = [];


        let product = await ProductModel.findById(productId)

        const files = req.files;

        if(files.length > 3) {
            return res.status(200).send({ error: "Maximum file upload cannot be more than 3"})
        }
        
        if(files.length > 0 && imageIds) {

            //DELETE OLD IMAGES

            const result = await ProductModel.findByIdAndUpdate(productId, 
                { $pull: {"product_images" : { "_id": { $in: imageIds } } }  
            });

            //UPLOAD NEW IMAGE
            for(const file of files) {
            const { path } = file;
            // Upload Image to cloudinary
            const { public_id, secure_url  } = await cloudinary.uploader.upload(path);

            product_images.push({ public_id, secure_url });
    
            fs.unlinkSync(path);
    
        }
        
        
        }

        if(name)   product_data["name"] = name
        if(category) product_data["category"] = category
        if(description) product_data["description"] = description
        product_data["product_variation"] = product_variation

        // if(price)  product_object['price'] = Number(price)
        // if(qty)    product_object["qty"] = Number(qty)
        // if(size)   product_object["size"] = size
        // if(color)  product_object["color"] = color

        if(product_images && product_images.length > 0) {
            product_data["product_images"] = product_images
        }

        // product_variation.push(product_object)

        // if(!!Object.keys(product_object).length) {
        //     product_data["product_variation"] = product_variation
        // }

        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { $set: product_data }, { new: truncate} );

        if(!updatedProduct) {
            return res.status(400).send("Unable to update product");
        }

        return res.status(200).send({ success: true, product: updatedProduct, });

    } catch (error) {

        if(error?.message === "Missing required parameter - public_id") {
            return res.status(400).send({ error: "Image id not found" })
        }

        return res.status(500).send({ error: error?.message });
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

                if(!uploaderResponse) {
                    return res.status(400).json({ error: "Unable to delete image"});
                }

            } catch (error) {
                return res.status(500).json({ error: error?.message });
            }

        }

        if(product && product?.product_images && product?.product_images?.length > 0) {
            
            product?.product_images.forEach((imageObject) => {
                //Delete all product images from cloudinary
                const deletedImages = multiDelete(imageObject.public_id);

                if(!deletedImages) {
                    return res.status(400).json({ error: "Unable to unset images"})
                }
            });
            
            //Delete product from database
            await product.remove();

        }

        return res.status(200).json({ success: "Product deleted successfully" });

    } catch (error) {

        if(error?.message === "Missing required parameter - public_id") {
            return res.status(400).json({ error: "Image id not found" });
        }

        return res.status(500).json({ error: error?.message });
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
    const { rating, comment } = req.body;
    const { productId } = req.params

    const { id: ratedBy, fullname: name, } = req.user;

    //http://localhost:2000/api/product/review

    /**
     * 
     * 
     * {
        "rating": 2,
        "review": "My Second Review",
        "productId": "6305024315f75044124bab97"
        }

     */

    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ error: "Invalid User"});
        }

        let oldProduct;

        let product;

        product = await Product.findById(productId)
        .populate('reviews', "rating name comment ratedBy")

        const isReviewed = product.reviews.find((review) => review.ratedBy.toString() === ratedBy.toString() )

        if(!!isReviewed) {

            let review = await ProductReview.findOne({ product: productId, ratedBy });

            review.rating = Number(rating)
            review.comment = comment            
            await review.save()


        product = await Product.findById(productId)
                               .populate('reviews', "rating name comment ratedBy")

        product.numOfReviews = product.reviews.length

        product.ratings = product.reviews.reduce((acc, curr) => acc + curr.rating , 0).toFixed(1) / product.reviews.length

      
        await product.save()
        
        } else {

            const newReview = new ProductReview({ rating:  Number(rating), comment, ratedBy, name, product: productId })
            
            const savedReview = await newReview.save()

            oldProduct = await Product.findById(productId)

            oldProduct.reviews.push(savedReview._id)
        
            product.ratings = product.reviews.reduce((acc, curr) => acc + curr.rating , 0).toFixed(1) / product.reviews.length
    
            product.numOfReviews = oldProduct.reviews.length
    
            product  = await oldProduct.save()
        }

        return res.status(200).send({ success: true, product })

        
    } catch (error) {
        // console.log(error)
        return res.status(500).send({ error: error.message });
    }
}

exports.canReviewProduct = async (req, res, next) => {

    const { id: currentUser } = req.user;

    const { productId } = req.params;

    try {

        const canReviewProduct = await Order.find({
                                    user: currentUser,
                                    $and: [
                                        { "orderItems.product": productId },
                                        { isPaid: true }
                                    ] });

        let canUserReviewThisProduct = canReviewProduct?.length > 0 ? true : false;

        let message = canReviewProduct?.length > 0 ? "You can review this product" : "You cannot review this product";

        return res.status(200).json({ status: "success", message, canUserReviewThisProduct })
        

    } catch (error) {
        return res.status(500).json({ status: "failed", message: error?.message, error: error?.message })
    }
}

exports.getAllReviews = async (req, res, next) => {
    
    //http://localhost:2000/api/product/:productId/reviews
    const { productId } = req.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ error: "Invalid Id"});
        }

        const reviews = await ProductReview.paginate({ product: productId })

        if(!reviews) return res.status(400).send({ error: "No review(s)"})

        return res.status(200).send({reviews});
        
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}