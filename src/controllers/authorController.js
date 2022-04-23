const AuthorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')

//================validation===================================================//
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

const isValidTitle = function(title) {
    return ['Mr', 'Mrs', "Miss"].indexOf(title) !== -1
}

//===================Create an author ===================================//
const createAuthor = async function(req, res) {

    try {
        let authorData = req.body
        let { title, fname, lname, email, password } = authorData

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "request body is empty ,BAD REQUEST" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "title is required" })
        }
        if (!isValidTitle(title)) {
            return res.send(400).send({ status: false, msg: "title should be among Mr,Mrs,Miss" })
        }
        if (!isValid(fname)) {
            return res.send(400).send({ status: false, msg: "first name is required" })
        }
        if (!isValid(lname)) {
            return res.send(400).send({ status: false, msg: "last name is required" })
        }
        if (!isValid(email)) {
            return res.send(400).send({ status: false, msg: "email is required" })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "emailId is not a valid emailId" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }
        if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "password length must be in between 8 to 15 and must contain at least one number and uppercase and lowercase letter" })
        }
        isEmailAlreadyUsed = await UserModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: " emailId is already used, please provide another emailId" })
        } else {

            let author = await AuthorModel.create(authorData)

            return res.status(200).send({
                status: true,
                message: "author created successfully",
                data: author
            })
        }
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

//======================================================author login=================================================//
const login = async function(req, res) {
    try {
        let username = req.body.email
        let pass = req.body.password

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "request body is empty ,BAD REQUEST" })
        }

        if ((!isValid(email)) && (!isValid(password))) {
            return res.status(400).send({ status: false, msg: " email and password is required " })
        }

        if (username && pass) {

            let author = await AuthorModel.findOne({ email: username, password: pass })

            if (!author) return res.status(404).send({ status: false, msg: "please provide valid username or password" })

            let payLoad = { authorId: author._id }

            let secret = "projectgroup3"

            let token = jwt.sign(payLoad, secret)

            res.status(200).send({ status: true, data: token })

        } else {

            res.status(400).send({ status: false, msg: "Please provide username and password" })
        }

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}
module.exports.createAuthor = createAuthor
module.exports.login = login