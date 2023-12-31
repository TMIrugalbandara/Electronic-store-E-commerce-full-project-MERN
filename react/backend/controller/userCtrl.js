const { generateToken } = require("../config/jwtToken");
const User = require("../models/userMOdel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require('uniqid');

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const { v4: uuidv4 } = require('uuid');


const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL_ID, // Use your environment variable for email
        pass: process.env.MP, // Use your environment variable for password
    },
});

const createUUID = () =>{
    const uuid = uuidv4();
    return uuid;
}


const createUser = asyncHandler(async(req, res) => {
    const email = req.body.email;
    req.body.uuid = createUUID();
    req.body.active = false;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        //create a new user
        const newUser = await User.create(req.body);

        const mailOptions = {
            from: `${process.env.MAIL_ID}`, // Replace with your Gmail email
            to: `${email}`,
            subject: 'Verification Code',
            text: `Your verification code is: http://localhost:5000/api/user/login/${req.body.uuid}`,
        };


        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            res.json({ message: 'Verification code sent to your email.' });
        } catch (error) {
            console.error('Email sending error:', error);
            res.status(500).json({ error: 'An error occurred while sending the email.' });
        }

        res.json(newUser);
    } else {
        throw new Error("User Already Exists");
    }
});
const loginUserCtrl = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    //check if user exists or not 
    const findUser = await User.findOne({ email });
    if (findUser && findUser.active && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id, {
                refreshToken: refreshToken,
            }, { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser.lastname,
            email: findUser.email,
            mobile: findUser.mobile,
            token: generateToken(findUser._id),
        });

    } else {
        throw new Error("Invalid Credentials or You'r account not activated");
    }
});

const activeAccount = asyncHandler(async(req, res) => {
    const { uuid } = req.params;
    //check if user exists or not
    const findUser = await User.findOneAndUpdate(
        { uuid },
        { $set: { active: true } }
    );

    if(findUser){
        res.json({ message: 'You are active' });
    }else{
        throw new Error("Something went wring");
    }
});

//admin Login
// const loginAdmin = asyncHandler(async(req, res) => {
//     const { email, password } = req.body;
//     if (findAdmin.role !== 'admin') throw new Error("Not Authorizes");
//     //check if user exists or not 
//     const findAdmin = await User.findOne({ email });
//     if (findAdmin && await findAdmin.isPasswordMatched(password)) {
//         const refreshToken = await generateRefreshToken(findAdmin._id);
//         const updateuser = await User.findByIdAndUpdate(
//             findAdmin.id, {
//                 refreshToken: refreshToken,
//             }, { new: true }
//         );
//         res.cookie("refreshToken", refreshToken, {
//             httpOnly: true,
//             maxAge: 72 * 60 * 60 * 1000,
//         });
//         res.json({
//             _id: findAdmin._id,
//             firstname: findAdmin.firstname,
//             lastname: findAdmin.lastname,
//             email: findAdmin.email,
//             mobile: findAdmin.mobile,
//             token: generateToken(findAdmin._id),
//         });

//     } else {
//         throw new Error("Invalid Credentials");
//     }
// });
const loginAdmin = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    // check if user exists or not 
    const findAdmin = await User.findOne({ email });

    // Validate if the found user has admin role
    if (findAdmin && findAdmin.role === 'admin' && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id, { refreshToken: refreshToken }, { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin._id,
            firstname: findAdmin.firstname,
            lastname: findAdmin.lastname,
            email: findAdmin.email,
            mobile: findAdmin.mobile,
            token: generateToken(findAdmin._id),
        });
    } else {
        throw new Error("Invalid Credentials or Not Authorized");
    }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies;


    if (!cookie.refreshToken) throw new Error("No Refresh Token in Cookies");

    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);

    const user = await User.findOne({ refreshToken });
    if (!user) throw new error('No Refresh token present in database or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {

        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user._id);
        res.json({ accessToken });
    });
});
//logout functionality
const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if (!cookie.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    // await User.findOneAndUpdate(refreshToken, {
    //     refreshToken: "",
    // });
    await User.findOneAndUpdate({ refreshToken: refreshToken }, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); // forbidden
});

//Update a user
// const updatedUser = asyncHandler(async(req, res) => {
//     const { id } = req.params;
//     try {
//         const updatedUser = await User.findByIdAndUpdate(
//             id, {
//                 firstname: req ? .body ? .firstname,
//                 lastname: req ? .body ? .lastname,
//                 email: req ? .body ? .email,
//                 mobile: req ? .body ? .mobile,
//             }, {
//                 new: true,
//             }
//         );
//         res.json(updatedUser);
//     } catch (error) {
//         throw new Error(error);
//     }
// });

const updatedUser = asyncHandler(async(req, res) => {
    //console.log.user;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id, {
                firstname: req.body ? req.body.firstname : undefined,
                lastname: req.body ? req.body.lastname : undefined,
                email: req.body ? req.body.email : undefined,
                mobile: req.body ? req.body.email : undefined,
            }, {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});
//Save user Address
const saveAddress = asyncHandler(async(req, res, next) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id, {
                address: req.body.address,
            }, {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

//Get all users
const getallUser = asyncHandler(async(req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);

    }
});
// module.exports = { createUser };

// const User = require("../models/userMOdel");

// const createUser = async(req, res) => {
//     const email = req.body.email;
//     const findUser = await User.find({ email: email });
//     if (!findUser) {
//         //create a new user
//         const newUser = await User.create(req.body);
//         res.json(newUser);
//     } else {
//         res.json({
//             msg: "User Already Exists",
//             success: false,
//         });
//     }
// };

// module.exports = { createUser };

// const User = require("../models/userMOdel");

// const createUser = async(req, res) => {
//     const email = req.body.email;
//     try {
//         const user = await User.findOne({ email });
//         if (user) {
//             return res.json({
//                 msg: "User Already Exists",
//                 success: false,
//             });
//         }
//         const newUser = await User.create(req.body);
//         res.json(newUser);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             msg: "Server Error",
//             success: false,
//         });
//     }
// };

//Get a single user

const getaUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getaUserNo = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const passwordRestRq = asyncHandler(async(req, res) => {
    const { id , password } = req.body;
    console.log(password)
    validateMongoDbId(id);
    const user = await User.findById(id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const getaUserUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//Delete user

const deleteaUser = asyncHandler(async(req, res) => {

    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    } catch (error) {
        throw new Error(error);
    }
});
const blockUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id, {
                isBlocked: true,

            }, {
                new: true,
            }
        );
        res.json(block);
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(
            id, {
                isBlocked: false,

            }, {
                new: true,
            }
        );
        res.json({
            message: "User UnBlocked",
        });

    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});
const forgotPasswordToken = asyncHandler(async(req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your Password. This link is valid for the next 10 minutes. <a href="http://localhost:5000/api/user/reset.password/${token}">Click Here</a>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});
const getWishlist = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});
const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;

    try {
        // Ensure user ID is a valid MongoDB ID
        validateMongoDbId(_id);

        // Find the user by ID
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // const Cart = mongoose.model("Cart");

        // Check if user already has a cart
        let existingCart = await Cart.findOne({ orderby: user._id });

        // If there is an existing cart, remove it (optional)
        // if (existingCart) {
        //     await existingCart.remove();
        // }

        let products = [];

        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;

            // Retrieve product price by ID
            const product = await Product.findById(cart[i]._id).select("price").exec();
            console.info(product)
            if (!product) {
                return res.status(404).json({ message: `Product not found for ID: ${cart[i]._id}` });
            }

            object.price = product.price;
            products.push(object);
        }

        let cartTotal = 0;

        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }

        // Create a new Cart instance and save it to the database
        let newCart = new Cart({
            products,
            cartTotal,
            orderby: user._id,
            active:true
        });

        const savedCart = await newCart.save();
        res.json(savedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


const getUserCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOne({ orderby: _id }).populate(
            "products.product"
        );
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});
const emptyCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const user = await User.findOne({ _id });
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});
const applyCoupon = asyncHandler(async(req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
        orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate({ orderby: user._id }, { totalAfterDiscount }, { new: true });
    res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async(req, res) => {
    const { COD, couponApplied ,firstName,  lastName , address , phone , city , zipCode , orderPrice} = req.body;
    console.info(orderPrice)
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        if (!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderby: user._id , active : true});
        let finalAmout = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmout = userCart.totalAfterDiscount;
        } else {
            finalAmout = userCart.cartTotal;
        }
        const createdAt = this.createdAt || new Date();
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: orderPrice,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "Rs",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
            year : createdAt.getFullYear(),
            month : createdAt.getMonth() + 1,
            firstName : firstName,
            lastName : lastName,
            address : address,
            phone : phone,
            city : city,
            zipCode : zipCode,
            orderPrice : orderPrice
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                },
            };
        });
        const updatedCart = await Cart.findByIdAndUpdate(
            userCart._id,
            { active: false },
            { new: true } // This option returns the updated document
        );
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: "success" });
    } catch (error) {
        throw new Error(error);
    }
});
const getOrders = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const userorders = await Order.find({ orderby: _id })
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllOrders = asyncHandler(async(req, res) => {
    
    
    try {
        const alluserorders = await Order.find()
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(alluserorders);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteOrder = asyncHandler(async(req, res) => {

    const { id } = req.params;
    console.log(id)
    try {
        const deleted = await Order.findByIdAndDelete(id)
        res.json(deleted);
    } catch (error) {
        throw new Error(error);
    }
});
const getOrderByUserId = asyncHandler(async(req, res) => {
    
    
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const userorders = await Order.findOne({ orderby: id })
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});

const getOrderById = asyncHandler(async(req, res) => {


    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const userorders = await Order.findById(id);
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
});

const updateOrderStatus = asyncHandler(async(req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id, {
                orderStatus: status,
                paymentIntent: {
                    status: status,
                },
            }, { new: true }
        );
        res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
});

const getMonthWiseOrder = asyncHandler(async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: "$year",   // Group by the 'year' field
                        month: "$month", // Group by the 'month' field
                    },
                    count: { $sum: "$orderPrice" }, // Count the number of orders in each group
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    year: "$_id.year",   // Include the 'year' field
                    month: "$_id.month", // Include the 'month' field
                    count: 1, // Include the count field
                },
            },
        ]);

        // Create an array of all 12 months with count set to 0
        const allMonths = Array.from({ length: 12 }, (_, i) => ({
            year: null, // You can set the year to null for all months
            month: i + 1, // Months are 1-indexed
            count: 0,
        }));

        // Fill in the missing months in the result
        result.forEach((item) => {
            const index = item.month - 1; // Adjust for 0-based index
            allMonths[index] = item;
        });

        // Map the data array to update the sales values
        const data = [
            { type: "Jan", sales: allMonths[0].count },
            { type: "Feb", sales: allMonths[1].count },
            { type: "Mar", sales: allMonths[2].count },
            { type: "Apr", sales: allMonths[3].count },
            { type: "May", sales: allMonths[4].count },
            { type: "Jun", sales: allMonths[5].count },
            { type: "July", sales: allMonths[6].count },
            { type: "Aug", sales: allMonths[7].count },
            { type: "Sept", sales: allMonths[8].count },
            { type: "Oct", sales: allMonths[9].count },
            { type: "Nov", sales: allMonths[10].count },
            { type: "Dec", sales: allMonths[11].count },
        ];

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const getOrdersAll = asyncHandler(async (req, res) => {

    try {
        const latestOrders = await Order.find({})
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .limit(10) // Limit the result to 10 documents
            .populate({
                path: "orderby", // Populate the 'orderby' field
                select: "firstname", // Select only the 'userName' field from the User model
            });

        res.json(latestOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const passwordReset = asyncHandler(async (req , res) =>{
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const mailOptions = {
            from: `${process.env.MAIL_ID}`, // Replace with your Gmail email
            to: `${user.email}`,
            subject: 'Verification Code',
            text: `Your verification link is: http://localhost:3000/reset-password/${user._id.toString()}`,
        };

        console.log(mailOptions)
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            res.json({ message: 'Verification link sent to your email.' });
        } catch (error) {
            console.error('Email sending error:', error);
            res.status(500).json({ error: 'An error occurred while sending the email.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


module.exports = { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, loginAdmin, getWishlist, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus,getAllOrders,getOrderByUserId ,activeAccount, deleteOrder , getOrderById , getaUserUser,getMonthWiseOrder , getOrdersAll , passwordReset , getaUserNo , passwordRestRq};