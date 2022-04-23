const mongoose = require('mongoose')

let validateEmail = function(email) {
    let regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regexForEmail.test(email)
};

const authorSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: true
    },

    fname: {
        type: String,
        required: true,
        trim: true
    },

    lname: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        validate: [validateEmail, "Please enter a valid email address"],
        required: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true })

module.exports = mongoose.model("Author", authorSchema)