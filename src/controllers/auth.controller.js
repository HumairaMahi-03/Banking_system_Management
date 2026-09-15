const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

async function userRegisterController(req, res) {

    const { email, password, name } = req.body;

    const isExist = await userModel.findOne({ email });

    if (isExist) {
        return res.status(400).json({
            message: "Email already exists",
            status: "failed"
        });
    }

    const newUser = new userModel({
        email,
        password,
        name
    });

    // Save user to MongoDB
    await newUser.save();

    const token = jwt.sign(
        {
            userId: newUser._id
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "3d"
        }
    );

    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        status: "success",
        token,
        user: {
            id: newUser._id,
            email: newUser.email,
            name: newUser.name
        }
    });

    await emailService.sendRegistrationEmail(newUser.email, newUser.name);
}


async function userLoginController(req, res) {

    const { email, password } = req.body;


    const user = await userModel
        .findOne({ email })
        .select('+password');

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    const token = jwt.sign(
        {
            userId: user._id
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "3d"
        }
    );

    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        user: {
            id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}


module.exports = {
    userRegisterController,
    userLoginController
};