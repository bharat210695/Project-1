const BlogsModel = require('../models/blogsModel')
const AuthorModel = require('../models/authorModel')
const ObjectId = mongoose.Types.ObjectId

//======================validation======================================================================//
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidObjectId = function(ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//===================================create blogs document===========================================================//

const createBlogs = async function(req, res) {
    try {
        let blogData = req.body

        if (Object.keys(blogData).length == 0) {
            return res.status(400).send({ status: false, msg: "request body is empty ,BAD REQUEST" })
        }
        let { title, body, authorId, tags, category, isPublished } = blogData

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "title is required" })
        }
        if (!isValidTitle(title)) {
            return res.send(400).send({ status: false, msg: "title should be among Mr,Mrs,Miss" })
        }
        if (!isValid(body)) {
            return res.status(400).send({ status: false, msg: "body is required" })
        }
        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, message: "authorId is not valid" })
        }
        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, message: 'authorId is not a valid object Id' })
        }
        if (!isValid(tags)) {
            return res.status(400).send({ status: false, message: "tags is required" })
        }
        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "category is required" })
        }
        const isTitleAlreadyUsed = await BlogsModel.findOne({ title })
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "title is already used" })
        }
        const author = await AuthorModel.findById(authorId)
        if (!author) {
            return res.status(400).send({ status: false, message: "author does not exist" })
        }

        const blog = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null

        }


        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blog['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === ['object String']) {
                blog['subcategory'] = [subcategory]
            }
        }

        const newBlog = await BlogsModel.create(blog)
        res.status(201).send({ status: true, message: "Blog created successfully", data: newBlog })

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

//===================================================Returns all blogs in the collection ===========================================//
const getFilteredBlogs = async function(req, res) {
    try {
        let input = req.query

        //* below methods for converting inputData to array of objects
        let filters = Object.entries(input)
        console.log(filters)
        let filtersAsObject = []
        let totalDocuments

        for (let i = 0; i < filters.length; i++) {
            let element = filters[i]
            let obj = {}
            obj[element[0]] = element[1]
            filtersAsObject.push(obj)
        }

        //* conditions are given in project documents and finalFilters will have both conditions & filters.

        let conditions = [{ isDeleted: false }, { isPublished: true }]
        let finalFilters = conditions.concat(filtersAsObject)

        //* handled two cases: (1) where client is using the filters (2) where client want to access all published data

        if (input) {
            let blogs = await BlogsModel.find({ $and: finalFilters })

            if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })

            res.status(200).send({ status: true, totalDocuments: blogs.length, data: blogs })

        } else {
            let blogs = await BlogsModel.find({ $and: conditions })

            if (blogs.length == 0) return res.status(404).send({ status: false, msg: "no blogs found" })

            res.status(200).send({ status: true, data: blogs })
        }
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

//=======================================Updates a blog ==========================================================//
const updateBlog = async function(req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromTOken = req.authorId

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: '${blogId} is not a valid objectId' })
        }
        if (!isValidObjectId(authorIdFromTOken)) {
            return res.status(400).send({ status: false, message: '${authorIdFromToken} is not a valid token ID' })
        }

        const blog = await BlogsModel.findOne({ id: blogId, isDeleted: false, deletedAt: null })
        if (!blog) {
            return res.status(404).send({ status: false, message: 'Blog not found' })
        }
        if (blog.authorId.toString() !== authorIdFromTOken) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info does not match" })
        }

        const { title, body, authorId, tags, category, isPublished } = requestBody;
        const updateBlogData = {}

        if (isValid(title)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['title'] = title
        }
        if (isValid(body)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['body'] = body
        }
        if (isValid(category)) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['category'] = category
        }
        if (isPublished !== undefined) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        if (tags) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            if (Array.isArray(tags)) {
                updateBlogData['$addToSet']['tags'] = { $each: [...tags] }
            }
            if (typeof tags === "string") {
                updateBlogData['$addToSet']['tags'] = tags
            }
        }
        if (subcategory) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}
            if (Array.isArray(subcategory)) {
                updateBlogData['$addToSet']['subcategory'] = { $each: [...subcategory] }
            }
            if (typeof subcategory === "string") {
                updateBlogData['$addToSet']['subcategory'] = subcategory
            }
        }

        const updateBlog = await BlogModel.findOneAndUpdate({
            _id: blogId
        }, updateBlogData, { new: true })
        res.status(200).send({ status: true, message: "Blog updated successfully", data: updateBlog });

    } catch (error) {
        console.log(error.message)
    }

}

//==================================================deleted blog============================================================//
const deleteBlog = async function(req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromTOken = req.authorId

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, message: '${blogId} is not a valid objectId' })
        }
        if (!isValidObjectId(authorIdFromTOken)) {
            return res.status(400).send({ status: false, message: '${authorIdFromToken} is not a valid token ID' })
        }

        const blog = await BlogsModel.findOne({ id: blogId, isDeleted: false, deletedAt: null })

        if (!blog) {
            return res.status(404).send({ status: false, message: 'Blog not found' })
        }
        if (blog.authorId.toString() !== authorIdFromTOken) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info does not match" })
        }

        await BlogsModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: false, message: 'Blog deleted successfully' })

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

//====================================================deleted blog by params================================================//
const deleteFilteredBlog = async function(req, res) {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null }
        const queryParams = req.query
        const authorIdFromToken = req.authorId

        if (!isValidObjectId(authorIdFromToken)) {
            return res.status(400).send({ status: false, message: "$(authorIdFromTOken) is not a valid token ID " })
        }
        if (!isValidObjectId(queryParams)) {
            return res.status(400).send({ status: false, message: "$(authorIdFromTOken) is not a valid token ID " })
        }

        const { authorId, category, tags, subcategory, isPublished } = queryParams

        if (isValid(authorId) && isValidObjectId(authorId)) {
            filterQuery['authorId'] = authorId
        }
        if (isValid(category)) {
            filterQuery['category'] = category
        }
        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = { $all: tagsArr }
        }
        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = { $all: subcatArr }
        }

        const blogs = await BlogsModel.find(filterQuery);
        if (Array.isArray(blogs) && blogs.length === 0) {
            return res.status(404).send({ status: false, message: 'No matching blog found' })
        }

        const idsOfBlogsToDelete = blogs.map(blog => {
            if (blog.authorId.toString() === authorIdFromToken) return blog._id
        })

        if (idsOfBlogsToDelete.length === 0) {
            return res.status(404).send({ status: false, message: "No blogs found" })
        }
        await BlogsModel.updateMany({ _id: { $in: idsOfBlogsToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: "Blog(s) deleted successfully" });

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}


module.exports.createBlogs = createBlogs
module.exports.getFilteredBlogs = getFilteredBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlog = deleteBlog
module.exports.deleteFilteredBlog = deleteFilteredBlog