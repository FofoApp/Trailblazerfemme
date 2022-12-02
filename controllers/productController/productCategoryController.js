const mongoose = require('mongoose');
const ProductCategoryModel = require('./../../models/productModel/productCategoryModel');
const { productValidation, productCategoryValidation } = require('./../../validations/productValidation');



exports.categories = async(req, res) => {

    try {
        const categories = await ProductCategoryModel.find({}).select("-updatedAt")
        if(!categories) {
            return res.status(404).send({ error: 'No response found '})

        }

        return res.status(200).send({ categories })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message })
    }
}


exports.createProductCategory = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING

    try {

        const result = await productCategoryValidation(req.body);

        const findIfCategoryExist = await ProductCategoryModel.findOne({ name: result.name });

        if(findIfCategoryExist) {
            return res.status(401).send({message: "Product Category already exsit"});
        }

        const createNewProductCategory = new ProductCategoryModel(result);

        const savedProductCategory = await createNewProductCategory.save();

        return res.status(200).send({message: "Product Category created Successfully", savedProductCategory});
        

    } catch (error) {
        return res.status(500).send(error.message);
    }
}


exports.allProductCategories = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //POST REQUEST
    //http://localhost:2000/api/product/category/create
    /**
     * 
    *   {
            "name": "Investment",
            "description":"Products on investment"
        }

     */

    try {
        const result = await productCategoryValidation(req.body);

        const findIfCategoryExist = await ProductCategoryModel.find({}).select('-__v -createdAt -updatedAt');

        if(findIfCategoryExist) {
            return res.status(401).send({message: "No Product Category yet", categories: [] });
        }

        return res.status(200).send( { categories: findIfCategoryExist });
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}



exports.searchProductByCategory = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //GET REQUEST
    //http://localhost:2000/api/product/category/search
    /**
    *       {
            "searchKeyword": "Investment"
            }
     */
    const searchKeyword = req.body.searchKeyword;

    try {
        // const result = await productCategoryValidation(req.body);

        let page = (req.query.page) ? parseInt(req.query.page) : 1;
        let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
        let skip = (page-1) * perPage;
 
    const searchForProductCategory = await ProductCategoryModel.find({
            $or: [
                { name: {  $regex: '.*' + searchKeyword + '.*',  $options: 'i'  } },
                { slug: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
                { description: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
            ],
            }
    ).skip(skip).limit(perPage);

      //.select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')
      if(!searchForProductCategory) {
        return res.status(200).send({message: "Product Category not found", categories: [] });
      }
      
      let total = searchForProductCategory ? searchForProductCategory.length : 0;

      let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
       
      return res.status(200).send({categories: searchForProductCategory, paginationData});
        

    } catch (error) {
        return res.status(500).send(error.message);
    }
}


exports.updateProductCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //PATCH REQUEST
    //http://localhost:2000/api/product/category/628cbc4949fca217cbf8962e/update

    const productCategoryId = req.params.productCategoryId;

    try {
        if(!mongoose.Types.ObjectId.isValid(productCategoryId)) {
            return res.status(401).send({ message: "Unkown product category searched"});
        }

        const result = await productCategoryValidation(req.body, true);

        const findIfCategoryExistAndUpdate = await ProductCategoryModel.findByIdAndUpdate({_id: productCategoryId}, {$set: result }, {new: true});

        if(!findIfCategoryExistAndUpdate) {
            return res.status(401).send({message: "Unable to update product category"});
        }

        return res.status(200).send({message: "Product Category updated Successfully", updatedProductCategory: findIfCategoryExistAndUpdate});
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}




exports.deleteProductCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //PATCH REQUEST
    //http://localhost:2000/api/product/category/628cbc7a49fca217cbf89667/delete

    const { productCategoryId } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(productCategoryId)) {

            return res.status(401).send({ message: "Unkown product category searched"});
        }

        const result = await productCategoryValidation(req.body, true);

        const findIfCategoryExistAndDelete = await ProductCategoryModel.findByIdAndDelete(productCategoryId);

        if(!findIfCategoryExistAndDelete) {
            return res.status(401).send({message: "Unable to update product category"});
        }

        return res.status(200).send({message: "Product Category deleted Successfully"});
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

