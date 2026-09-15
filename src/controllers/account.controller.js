const accountModel  = require('../models/account.model');


async function createAccountController(req, res) {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        message: "Account created successfully",
        status: "success",
        account
    });
}   

async function getUserAccountsController (req,res){
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        message: "User accounts fetched successfully",
        status: "success",
        accounts
    });

}



module.exports = {
    createAccountController,
    getUserAccountsController
}