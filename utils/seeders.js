require('./../initDB')();
const dotenv = require('dotenv').config();

const UserModel = require('./../models/UserModel');
const BlogModel = require('./../models/blogModel/BlogModel');
const BookModel = require('./../models/bookLibraryModel/BookModel');
const CourseModel = require('./../models/courseModel/CourseModel');
const JobModel = require('./../models/jobModel/JobModel');
const PodcastModel = require('./../models/podcast/PodcastModel');
const ProductModel = require('./../models/productModel/ProductModel');

// const users = require('./../data/user')
// const {blogs} = require('./../data/blog')
// const {books} = require('./../data/books')
const {podcasts} = require('./../data/podcast')


// const {courses} = require('./../data/courses')
// const {jobs} = require('./../data/jobs')

const {products} = require('./../data/product')

// I am bring a new programming language


const seedUsers = async () => {

    try {
        
        // await UserModel.deleteMany();
        // console.log("Users deleted successfully")

        // await UserModel.insertMany(users.users);
        // console.log("Users seeded successfully")




        // await BlogModel.deleteMany();
        // await BlogModel.insertMany(blogs);
        // console.log("Blogs seeded successfully")

        // await BookModel.deleteMany();
        // await BookModel.insertMany(books);
        // console.log("Blogs seeded successfully")

        await PodcastModel.deleteMany();
        await PodcastModel.insertMany(podcasts);
        console.log("Blogs seeded successfully")


        // await ProductModel.deleteMany();
        // await ProductModel.insertMany(products);
        // console.log("Blogs seeded successfully")










        // await CourseModel.deleteMany();
        // await CourseModel.insertMany(courses);
        // console.log("Blogs seeded successfully")

        // await JobModel.deleteMany();
        // await JobModel.insertMany(jobs);
        // console.log("Blogs seeded successfully")



        // await ProductModel.deleteMany();
        // await ProductModel.insertMany(products);
        // console.log("Blogs seeded successfully")



        process.exit();

    } catch (error) {

        console.log(error.message);
        process.exit();

    }
}


seedUsers();

