const CourseCategory = require('./../../models/courseModel/CourseCategoryModel');
const CourseModel = require('./../../models/courseModel/CourseModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const CourseReview = require('../../models/courseModel/CourseReviewModel');


const cloudinaryImageUploadMethod = async file => {
    return new Promise(resolve => {
        cloudinary.uploader.upload( file , (err, { secure_url, public_id}) => {
          if (err) throw new Error("upload image error")

          resolve({ secure_url, public_id })

          }
        ) 
    })
  }



exports.createNewCourse = async (req, res) => {

    const { 
        name, 
        accessType, 
        duration, 
        description,
        author_name_one,
        author_name_two, 
        author_name_three,
        category
    } = req.body;


    try {

        let author_data = [];

        const findCourseCategory = await CourseCategory.findById(category);

        if(!findCourseCategory) return res.status(400).json({ error: 'Course category does not exist' });

        const findCourseExist = await CourseModel.findOne({ name });

        if(findCourseExist) return res.status(400).json({ error: `Course ${name} already exist` });

        if(!req.files.courseImage) {
            return res.status(400).json({ error: `Please provide course Image` });
        }

        if(!req.files) {
            return res.status(400).json({ error: "Please upload author image"});
        }


        if(req?.files?.author_image_one && req?.files?.author_image_one[0]?.fieldname === 'author_image_one' ) {

            if(!author_name_one) {
                return res.status(400).json({ error: `Please provide author one name` });
            }

            const { public_id, secure_url  } = await cloudinaryImageUploadMethod(req?.files?.author_image_one[0].path);


            author_data.push({ public_id, image_url: secure_url,  fullname: author_name_one })
        }

        if(req?.files?.author_image_two && req?.files?.author_image_two[0]?.fieldname === 'author_image_two') {
            if(!author_name_two) {
                return res.status(400).json({ error: `Please provide author two name` });
            }
   
            const { public_id, secure_url  } = await cloudinaryImageUploadMethod(req?.files?.author_image_two[0].path);
            author_data.push({ public_id, image_url: secure_url,  fullname: author_name_two })
        
        }

        if(req?.files?.author_image_three  && req?.files?.author_image_three[0]?.fieldname === 'author_image_three') {

            if(!author_name_three) {
                return res.status(400).json({ error: `Please provide author three name` });
            }

            const { public_id, secure_url  } = await cloudinaryImageUploadMethod(req?.files?.author_image_three[0].path);
            author_data.push({ public_id, image_url: secure_url,  fullname: author_name_three })

        }

        const { public_id, secure_url  } = await cloudinaryImageUploadMethod(req?.files?.courseImage[0].path);

        const course_data = {
            name, 
            accessType, 
            duration, 
            description,
            category,
            courseImage: [{
                public_id: public_id,
                image_url: secure_url,
            }],

        createdBy: author_data
    }

        const course = await CourseModel.create(course_data);

        return res.status(201).json({ course });
        
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ error: error})
    }
}

exports.findAllCourses = async (req, res) => {
    try {

        // let query = {};

        // if(req.query.keyword) {
        //     query.name  = { $regex: new RegExp(req.query.keyword), $options: "i" }
        // }

        const keyword = req.query.keyword
        ? { name: { $regex: '.*' + req?.query?.keyword + '.*', $options: 'i' } } 
        : {}


        const categories = await CourseCategory.paginate({}, {
            page: 1,
            limit: 10,
            select: "id name"
        })

        let courses  = await CourseModel.paginate(keyword, {});

        if(!courses || courses.length === 0) return res.status(404).json({ error: "No course found"});

       const course_details = courses?.docs.map((course) => {

        const  {id, name, description, courseImage, createdBy, accessType, duration, courseLikes, new_joined, reviewIds, createdAt } = course;

        let courseImg = courseImage[0]["image_url"];
        let courseImgId = courseImage[0]["_id"];

        // const ratings_avg = reviewIds.reduce((acc, item) => item.rating + acc, 0 ) / reviewIds.length
        

        const author = createdBy.map(({_id, fullname, public_id, image_url }) => ({ id: _id, fullname,  image_url   }))
        
        return {
                id, 
                name, 
                description, 
                accessType, 
                duration,
                courseImage: courseImg, 
                courseImageId: courseImgId, 
                createdBy: author,
                createdAt
            }
        
       })

       const  { docs, ...others } = courses;

       const course_response = { categories, courses: { docs: course_details, ...others   }}

        return res.status(200).json({ ...course_response })
        
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.searchCourse = async (req, res) => {
    const { name, title } = req.query
    
    const query = {}
    const conditions = []

    // {
    //     $or: [
    //         { name: { $regex: '.*' + keyword + '.*', $options: 'i' } },
    //         { title: { $regex: '.*' + keyword + '.*', $options: 'i' } },
    //     ]
    // }

    //METHOD: 1

    if(name) conditions.push({ name: { $reqex: '.*' + name + '.*',  $options: 'i' } })
    if(title) conditions.push({ title: { $reqex: '.*' + title + '.*', $options: 'i' } })

    // const valid = [name, title].some(Boolean)
    // if(valid) query.$or = conditions

    if(name || title) query.$or = conditions

    //METHOD: 2

    if(req.query) {

        for(let key in req.query) {
            if(req.query.hasOwnProperty(key)) {
                const search_keyword = req.query[key]
                conditions.push( { search_keyword: { $regex: '.*' + search_keyword + '.*', $options: 'i' }  } )
                query.$or = conditions

            }else {
                query = {}
            }
        }
        
    }


    try {

        const result = await CourseModel.paginate(query, {});

        return res.status(500).send({ result })

    } catch (error) {
        return res.status(500).json({ error: error?.message })
    }
}

exports.findCourseById = async (req, res) => {

    const { courseId } = req.params;

    try {

        let course = await CourseModel.findById(courseId).lean()
       
        if(!course) return res.status(404).send({ status: 'failed',  error: "Course not found "});

        let course_rev = await CourseReview.find({ courseId })
        
        const createdBy = course.createdBy.map(({ _id, fullname, public_id, image_url }) => ({ id: _id, fullname, image_url   }))
        
        course.id = course._id
        course["courseImage"] = course.courseImage[0].image_url
        course["courseImgId"] = course.courseImage[0]._id
   

        course['ratings_avg'] = (course_rev.reduce((acc, item) => item.rating + acc, 0 ) / course_rev.length) || 0


        delete course._id
        delete course.__v
        delete course.courseLikes
        delete course.new_joined
        delete course.reviewIds
        delete course.updatedAt

        //COURSE REVIEWS
        const course_reviews = await CourseReview.paginate({ courseId }, {
            select: "-updatedAt -__v",
            populate: {
                path: "reviewdBy",
                model: "User",
                select: "id fullname profileImage"
            }
        });

        //SIMILAR COURSE

        const similar_course = await CourseModel.paginate({ $sample: { size: 40 } }, { });

        const course_details = similar_course?.docs.map((course) => {

            const  { id, name, description, courseImage, createdBy, accessType, duration, courseLikes, new_joined, reviewIds, createdAt } = course;
    
            let courseImg = courseImage[0]["image_url"];
            let courseImgId = courseImage[0]["_id"];

            let ratings_avg = (course_rev.reduce((acc, item) => item.rating + acc, 0 ) / course_rev.length) || 0
    
            const author = createdBy.map(({ _id, fullname, public_id, image_url }) => ({ id: _id, fullname,  image_url   }))
            
            return { id, name,  description, accessType, duration, courseImage: courseImg, 
                    courseImageId: courseImgId, createdBy: author, createdAt, ratings_avg }
           })


        const  { docs, ...others } = similar_course;

        const course_response = { similar: { docs: course_details, ...others   } }

        const course_resp = { course: { ...course, createdBy }, ...course_response, course_reviews  }

        return res.status(200).json(course_resp)

    } catch (error) {
         return res.status(500).json({ status: 'failed', error: error?.message })
    }
}

exports.updateCourse = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

exports.deleteCourse = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}