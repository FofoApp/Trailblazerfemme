const CourseCategory = require('./../../models/courseModel/CourseCategoryModel');
const CourseModel = require('./../../models/courseModel/CourseModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const CourseReview = require('../../models/courseModel/CourseReviewModel');


const cloudinaryImageUploadMethod = async file => {
    return new Promise(resolve => {
        cloudinary.uploader.upload( file , (err, res) => {
          if (err) return res.status(500).send("upload image error")
            resolve({
                secure_url: res.secure_url,
                public_id: res.public_id,
            })
          }
        ) 
    })
  }



exports.createNewCourse = async (req, res) => {

    const { name, accessType, duration, description } = req.body;

    try {

        const findCourseExist = await CourseModel.findOne({ name });

        if(findCourseExist) return res.status(400).json({ error: `Course ${name} already exist` });

        const courseImage = req.files.courseImage[0];

        const result = await cloudinary.uploader.upload(courseImage.path);
        if(!result) return res.status(400).json({ error: "Unable to upload course Image "});

        const urls = [];

        const files = req.files.author_image;

        for(let file of files) {
            const { path } = file;
            const newPath = await cloudinaryImageUploadMethod(path);

            urls.push(newPath);
        }

        const author_name = req.body.author_name;
        const author_image = req.files.author_image;

        
        const createdBy = author_name.map((item, index) => {
            return { 
                fullname: item,
                image_url: urls[index]["secure_url"],
                public_id: urls[index]["public_id"],
            }
        });

    const course_data = {
        name, 
        accessType, 
        duration, 
        description, 
        courseImage: [{
            public_id: result.public_id,
            image_url: result.secure_url,
        }],
        createdBy
    }


        const course = await CourseModel.create(course_data);

        return res.status(201).json({ course });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}

exports.findAllCourses = async (req, res) => {
    try {

        const categories = await CourseCategory.paginate({}, {
            page: 1,
            limit: 10,
            select: "id name"
        })

        let courses  = await CourseModel.paginate({}, {
            
        });
        if(!courses || courses.length === 0) return res.status(404).json({ error: "No course found"});

       const course_details = courses?.docs.map((course) => {

        const  {id, name, description, courseImage, createdBy, accessType, duration, courseLikes, new_joined, reviewIds, createdAt } = course;

        let courseImg = courseImage[0]["image_url"];
        let courseImgId = courseImage[0]["_id"];

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
    try {
        
    } catch (error) {
        
    }
}

exports.findCourseById = async (req, res) => {

    const { courseId } = req.params;

    try {

        let course = await CourseModel.findById(courseId).lean()

        if(!course) return res.status(404).send({ error: "Course not found "});
        
        const createdBy = course.createdBy.map(({ _id, fullname, public_id, image_url }) => ({ id: _id, fullname, image_url   }))
        
        course.id = course._id
        course["courseImage"] = course.courseImage[0].image_url
        course["courseImgId"] = course.courseImage[0]._id

        delete course._id
        delete course.__v
        delete course.courseLikes
        delete course.new_joined
        delete course.reviewIds
        delete course.updatedAt

        //COURSE REVIEWS
        const course_reviews = await CourseReview.paginate({}, {
            select: "-updatedAt -__v",
            populate: {
                path: "reviewdBy",
                model: "User",
                select: "id fullname profileImage"
            }
        });

        //SIMILAR COURSE

        const similar_course = await CourseModel.paginate({$sample: { size: 40 } }, { });

        const course_details = similar_course?.docs.map((course) => {

            const  { id, name, description, courseImage, createdBy, accessType, duration, courseLikes, new_joined, reviewIds, createdAt } = course;
    
            let courseImg = courseImage[0]["image_url"];
            let courseImgId = courseImage[0]["_id"];
    
            const author = createdBy.map(({ _id, fullname, public_id, image_url }) => ({ id: _id, fullname,  image_url   }))
            
            return { id, name,  description, accessType, duration, courseImage: courseImg, 
                    courseImageId: courseImgId, createdBy: author, createdAt }
           })


        const  { docs, ...others } = similar_course;

        const course_response = { similar: { docs: course_details, ...others   } }

        const course_resp = { course: { ...course, createdBy }, ...course_response, course_reviews  }

        return res.status(200).json(course_resp)

    } catch (error) {
         return res.status(500).json({ error: error.message })
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