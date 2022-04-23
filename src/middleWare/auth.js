const jwt = require('jsonwebtoken')
const BlogsModel = require('../models/blogsModel')

const authentication = async function (req, res, next) {

    try {
        let token = req.headers["x-api-key"]

        if (!token) return res.status(400).send({ status: false, msg: "please provide token" })

        let validateToken = jwt.verify(token, "projectgroup3")

        //! below condition execution chances are very low as catch block will handle the invalid token error
        
        if (!validateToken) return res.status(401).send({ status: false, msg: "authentication failed" })

        req['authenticateToken'] = token

        next()

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}


const authorization = async function (req, res, next) {

    let id = req.params.blogId
    let jwtToken = req['authenticateToken']
    try {

        let blogs = await BlogsModel.findById(id)

        if (!blogs) return res.status(404).send({ status: false, msg: "please provide valid blog ID" })

        if (blogs.isDeleted == true) return res.status(404).send({ status: false, msg: "no such blog found" })

        let verifiedToken = jwt.verify(jwtToken, "projectgroup3")

        if (verifiedToken.authorId != blogs.authorId) return res.status(403).send({ status: false, msg: "unauthorize access " })

        next()

    } catch (error) {
        res.status(500).send({ error: error.message })
    }

}

module.exports.authentication = authentication
module.exports.authorization = authorization