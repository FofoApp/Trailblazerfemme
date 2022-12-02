const fs = require('fs');
const mongoose = require('mongoose');
const ProductModel = require('../../models/productModel/ProductModel');
const productCategoryModel = require('../../models/productModel/productCategoryModel');
const ReviewModel = require('../../models/productModel/productReviewModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const { productValidation } = require('./../../validations/productValidation');
const ProductCategory = require('../../models/productModel/productCategoryModel');
const { truncate } = require('fs/promises');

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

    let { name, qty = 0, price = 0, size, category, color,description } = req.body;
   
    try {

        let product = await ProductModel.findOne({ name });

        if(product) return res.status(400).send({ error: "Product name already taken"});

        const product_category = await ProductCategory.findById(category)

        if(!product_category) return res.status(400).send({ error: "Product category not found"});

        let product_images = [];

        const files = req.files;

        if(files.length > 3) {
            return res.status(200).send({ error: "Maximum file upload cannot be more than 3"})
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
            product_variation: [
                { price: Number(price), qty: Number(qty), size,  color }
            ]
        }

        
        const new_product = new ProductModel(product_data);

        const savedProduct  = await new_product.save();

        product_category.products.addToSet(savedProduct._id)

        await product_category.save()

        if(!savedProduct) return res.status(400).send({ success: false, error: "Unable to create product"});

        return res.status(201).send({ success: true, product: savedProduct});




    } catch (error) {
        // console.log(error)
        return res.status(500).send({ error: error.message })
    }


}

exports.listProducts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/lists
    try {

        const search = req.query.search ? {
            name: { $regex: '.*' + req.query.search + ".*", $options: 'i' } 
        } : {}

        const product_category = await productCategoryModel.find({})
        
        const products2 = await ProductModel.paginate(search)

        // const products = await ProductModel.find({}).populate('category', "name _id")

        if(!products2 || products2.docs.length === 0) {
            return res.status(200).send({ error: "No product found", products: [] });
        }

        return res.status(200).send({ success: true, categories: product_category, products: products2 });
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


        //PRODUCTS YOUR MAY LIKE
        const product_you_may_like = await ProductModel.find({
            $sample: { size: 10 }
        })

        const product = await ProductModel.findById(productId);

        return res.status(200).send({ product, product_you_may_like, });

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

exports.updateProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //PATCH REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/update

        const { productId } = req.params;

        let {  name, qty = 0, price = 0, size, category, color, description, imageIds } = req.body;

        if(imageIds) imageIds = imageIds.split(',')

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


        let product = await ProductModel.findById(productId)

        let product_images = [];

        const files = req.files;

        console.log(files)

        if(files.length > 3) {
            return res.status(200).send({ error: "Maximum file upload cannot be more than 3"})
        }
        
        if(files.length > 0 && imageIds) {

            //DELETE OLD IMAGES
            // imageIds.forEach(id => product.product_images.pull({ _id: { $elemMatch: id } }));

            // product.pullAll({ _id: { $in: imageIds } })

            const result = await ProductModel.findByIdAndUpdate(productId, 
                { $pull: {"product_images" : { "_id": { $in: imageIds } } }  
            });

            console.log(result)
            //UPLOAD NEW IMAGE
            for(const file of files) {
            const { path } = file;
            // Upload Image to cloudinary
            const { public_id, secure_url  } = await cloudinary.uploader.upload(path);

            product_images.push({ public_id, secure_url });
    
            fs.unlinkSync(path);
    
        }
        
        
        }

        if(name) product_data["name"] = name

        if(price) product_object['price'] = Number(price)
        if(qty) product_object["qty"] = Number(qty)
        if(size) product_object["size"] = size
        if(color) product_object["color"] = color


        if(category) product_data["category"] = category
        if(description) product_data["description"] = description
        if(product_images && product_images.length > 0) product_data["product_images"] = product_images

        product_variation.push(product_object)

        if(!!Object.keys(product_object).length) product_data["product_variation"] = product_variation

        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, { $set: product_data }, { new: truncate} );

        if(!updatedProduct) return res.status(400).send("Unable to update product");

        return res.status(200).send({ success: true, product: updatedProduct, });

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

        if(product && product.product_images && product.product_images.length > 0) {
            
            product.product_images.forEach((imagePublicId) => {
                const deletedImages = multiDelete(imagePublicId.public_id);
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