const express=require('express');
const user_route=express();
const session=require("express-session");
const config=require("../config/config");
const userController=require("../controllers/userController");
const auth=require("../middleware/auth");
const Razorpay=require('razorpay');
var instance = new Razorpay({key_id:config.YOUR_KEY_ID,key_secret:config.YOUR_KEY_SECRET,});


user_route.use(session({secret:config.sessionSecret,resave: true, saveUninitialized: true}));

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

user_route.get("/", function (req, res) {
    if (req.session.user || req.session.admin) {
      res.redirect("/user");
    } else {
      res.redirect("/user");
    }
  });



user_route.get('/user',userController.homeLoad);
user_route.get('/login',userController.loginLoad);
user_route.get("/logout", auth.userLogout);
user_route.get('/category',userController.categoryLoad);
user_route.get('/register',userController.RegisterLoad);
user_route.get('/contact',userController.contactLoad);
user_route.get('/product',userController.productView);
user_route.get('/viewproducts',userController.viewShopProducts);

user_route.get('/profile',auth.userLogin,userController.profileView);
user_route.get('/profileEdit',auth.userLogin,userController.profileEdit);
user_route.get('/address',auth.userLogin,userController.addNewAddress);
user_route.post('/address',auth.userLogin,userController.addAddress);
user_route.get('/checkout-address',auth.userLogin,userController.addNewAddressCheckout);
user_route.post('/checkout-address',auth.userLogin,userController.addAddressCheckout);
user_route.get('/edit-address',auth.userLogin,userController.loadEditAddress);
user_route.post('/edit-address',auth.userLogin,userController.editAddress);
user_route.get('/delete-address',auth.userLogin,userController.deleteAddress);
user_route.post("/removeaddress-checkoutpage",auth.userLogin,userController.removeaddresscheckoutpage);
user_route.get('/order',auth.userLogin,userController.loadOrder);
user_route.get('/single-order',auth.userLogin,userController.loadSingleOrder);
user_route.get('/download-Invoice',auth.userLogin,userController.invoiceDownload);
user_route.get('/cancel-order',auth.userLogin,userController.cancelOrder)
user_route.post('/profileEdit',auth.userLogin,userController.updateProfile);

user_route.get("/cart",auth.userLogin,userController.cart);
user_route.post('/addtocart',auth.userLogin,userController.addToCart);
user_route.delete('/removeproduct/:id',userController.removeCartProduct);
user_route.get("/checkout",userController.loadcheckoutpage);
user_route.post('/checkout',auth.userLogin,userController.checkOut);
user_route.post('/place-order',userController.placeOrder);
user_route.post('/validateCoupon',userController.coupon)
user_route.get('/success',userController.successorder);

user_route.get("/edit-checkOutAddress",userController.loadeditaddresscheckoutpage);
 user_route.post("/edit-checkOutAddress",userController.editAddressCheckout);

user_route.get('/wishlist',auth.userLogin,userController.loadWishlist);
user_route.post('/addwishlist',auth.userLogin,userController.addWishlist);
user_route.post('/removewishlist',auth.userLogin,userController.removeWishlist);

user_route.get("/forgetPassword",userController.forgetPassword);
user_route.post("/forgetPassword",userController.forgetVerify);
user_route.get("/forget-Password",auth.userLogout,userController.forgetPasswordLoad);
user_route.post("/forget-Password",userController.resetPassword);

user_route.post("/register",userController.sendOtp);
user_route.post('/verify-otp',userController.verifyOtp);
user_route.post('/login',userController.verifyLogin);

user_route.post('/create/orderId',(req,res)=>{
  console.log("Create OrderId Request",req.body)
  var options = {
    amount: req.body.amount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "rcp1"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    res.send({orderId:order.id});//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
  });
});

user_route.post("/api/payment/verify",(req,res)=>{

  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256',config.YOUR_KEY_SECRET)
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.response.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.response.razorpay_signature)
    response={"signatureIsValid":"true"}
       res.send(response);
});

module.exports=user_route;                  