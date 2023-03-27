require('dotenv').config();
const PDFDocument = require('pdfkit');
const pdfmake = require('pdfmake');
const fs = require('fs');
const PDFTable = require('pdfkit-table');
const User=require('../model/userSchema');
const Category=require('../model/categorySchema');
const Coupon =require("../model/coupenSchema")
const { ObjectId } = require('mongodb');
const nodemailer = require("nodemailer")
const Product=require('../model/productSchema');
const Order=require("../model/orderSchema");
const randomstring = require("randomstring");
const config = require("../config/config");
const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const verifySid = "VAd64e1f0d237c26ae64674d3190817874"
const client = require('twilio')(accountSid, authToken);
const bcrypt=require('bcrypt');
const moment = require('moment')




function generateOTP() {
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

const securePassword=async(password)=>{
try{
   const passwordHash= await bcrypt.hash(password,10);
   return passwordHash;
 }
catch(error){
  res.render('error');
 }
}

// for reset password send mail
const sendResetPasswordMail = async(name,email,token)=>{
try{
const transporter= nodemailer.createTransport({
service:"gmail",
auth:{
  user:config.emailUser,
  pass:config.emailPassword 
}});
const mailOptions={
  from:config.emailUser,
  to:email,
  subject :"For reset Password",
  html:'<p>Hii '+name+' , please click here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'">Reset</a> your password</p>'
}
transporter.sendMail(mailOptions,function(error,info){
  if(error){
    res.render('error');
  }else{
    console.log("Email has been sent :-",info.response);
  }
})
}catch(error){
  res.render('error');
}}

const sendOtpMail = async(email,otp)=>{
  try{
  const transporter= nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:config.emailUser,
    pass:config.emailPassword 
  }});
  const mailOptions={
    from:config.emailUser,
    to:email,
    subject :"For reset Password",
    html:'<p> Your Shoemart registration one time password is  '+otp+' </p>'
  }
  transporter.sendMail(mailOptions,function(error,info){
    if(error){
      res.render('error');
    }else{
      console.log("Email has been sent :-",info.response);
    }
  })
  }catch(error){
    res.render('error');
}} 

const loadRegister=async(req,res)=>{
 try{
    res.render('registration');
 }catch(error){
  res.render('error');
   }
}

const forgetPassword=async(req,res)=>{
  try{
     res.render('forgetPassword');
  }catch(error){
    res.render('error');
    }
}

const forgetVerify=async(req,res)=>{
  try{
      const email=req.body.email;
    const userData = await User.findOne({email:email})
if(userData){
     const randomString =randomstring.generate();
    const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
    sendResetPasswordMail(userData.name,userData.email,randomString);
    res.render('forgetPassword',{message :"Please check your mail to Reset your password."});
}else{
  res.render('forgetPassword',{message :"Email is incorrect , user not found"});
}  
  }catch(error){
    res.render('error');
    }
}

 const forgetPasswordLoad =async(req,res)=>{
  try {
  const token=req.query.token;
  const tokenData =await User.findOne({token:token});
  if(tokenData){
    res.render("forget-password",{user_id:tokenData._id});
  }else{
    res.render("404");
  }   
  } catch (error) {
    res.render('error');
}}

const resetPassword= async(req,res)=>{
  try {
    const password = req.body.password;
    const user_id =req.body.user_id;

    const  secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
     res.redirect("/login");
  } catch (error) {
    res.render('error');
  }
}

const homeLoad = async (req,res)=>{
  const category= await Category.find({})
     const product =await Product.find({isDeleted: false})
  if (req.session.user) {
    userData = req.session.userData;
    User.findOne({_id:userData._id}).then((user)=>{
        res.render("index", {userData: userData,category:category,product:product});
  })
  } else {
    res.render("index",{category:category,product:product});
}};

const loginLoad = async(req,res)=>{
    try{
      if (req.session.user) {
      res.redirect("/user");
    } else {
      res.render("login");
    }
    }catch(error){
      res.render('error');
    }
}

const categoryLoad = async(req,res)=>{
    try{
      var search = '';
    if(req.query.search){
      search = req.query.search;
    }
     const category= await Category.find({})
     const product =await Product.find({isDeleted:false,$or:[
      {productName: {$regex: '.*'+ search +'.*',$options:'i'}},
    ]})
        res.render("category",{category:category,product:product});
    }catch(error){
      res.render('error');
    }
}



const viewShopProducts = async(req,res) => {
  try {
  const categoryData = await Category.findOne({_id:req.query.categoryid})
  const productData = await Product.find({category:req.query.categoryid, isDeleted: false})  
      res.render('categoryProducts',{products:productData , category:categoryData , logged:1})
  } catch (error) {
      res.render('error');
  }
}

const contactLoad = async(req,res)=>{
  try{if (req.session.user) {
    res.render("contact");
  } else {
    res.render("/login");
  }
  }catch(error){
    res.render('error');
  }
}

const RegisterLoad = async(req,res)=>{
    try{
        res.render("registration");
    }catch(error){
      res.render('error');
    }
}


var saavedOtp;
var naame;
var email;
var moobile;
var paassword;

const sendOtp = async (req, res) => {
    try {
      const otp = generateOTP();
      saavedOtp = otp;
      naame=req.body.name;
      email =req.body.email;
      moobile =req.body.mno;
      paassword =req.body.password;
      const mobileNumber = req.body.mno;
      console.log(otp);
      const mobile= await User.findOne({ mobile:req.body.mno})
      if(!mobile){
        // const message = await client.messages.create({
      //   body: `SHOEMART VERIFICATION : Your OTP is ${otp} , Dont share your otp`,
      //   from: "+18315866942",
      //   to: "+919544150216"
      // });
    //   res.send('OTP sent successfully');
      sendOtpMail(email,otp)
      res.render("otp");
      }else{
        res.render("registration",{message:"Your mobile number is already registered"})
      }  
    } catch (error) {
      res.status(500).send('Error sending OTP');
    }
};

const  verifyOtp =async(req, res) => {
    const otp = req.body.otp;
    const storedOtp = req.session.otp;
    if (otp === saavedOtp) {
      console.log("otp checked");
      // Register the user and store their details
      // Notify the user that their registration is successful
    //   const insertUser=async(req,res)=>{
    //     try{
            const password= await securePassword(paassword);
            const user= new User({
                name:naame,
                email:email,
                mobile:moobile,
                password:password,
                blockStatus: false,
                // salt:"someRandomSaltValue",
                is_admin:0
            });
            console.log(email);
           userEmail = await User.findOne({email:email})
             if(!userEmail){
            const userData= user.save();
            console.log("its working");
            console.log(userData);
            if(userData){
                res.render('registration',{message:"Your registration has been successful,Please verify your mail.."})
            }
            else{
                res.render('registration',{message:"Your registration has been failed"})
            }
          }
          else{
            res.render('registration',{message:"Entered Email is already Exists"})
          }
    } else {
      // res.status(401).send('Invalid OTP');
      res.render("otp",{error:"Invalid OTP"});
    }
};

const verifyLogin=async(req,res)=>{
    try{
     const email=req.body.email;
     const password=req.body.password;
     const user=await User.findOne({email:email});
     if(user){
        const passwordMatch=await bcrypt.compare(password,user.password)
        if(passwordMatch)
        { 
          if(user.blockStatus){
            res.render('login',{message:"Your Account is blocked by admin.."});
          }else{
            req.session.userData=user;
            req.session.user=true;
            res.redirect("/user")
          }
         } 
         else{
            res.render('login',{message:"Email and  Password is  Invalid"});
         }
        }
         else{
            res.render('login',{message:"Email and  Password is  Invalid"});
            } 
     }
        
    catch(error){
        req.session.user=false;
        res.render('error');
    }
}

const profileView = async(req,res)=>{
      try{
        const userData = req.session.userData;
        const id = await User.findById({_id:userData._id});
        const categoryData= await  Category.find({})
        // const cartData= await  Cart.find({owner:userData._id})
          res.render("profile",{userData:id,category:categoryData,address:id.Address});
      }catch(error){
        res.render('error');
      }
}

const addNewAddress = async (req, res) => {
    try {
        res.render('addNewAddress')
    } catch (error) {
      res.render('error');
    }
}

const addNewAddressCheckout = async (req, res) => {
  try {
      res.render('addNewAddressCheckout')
  } catch (error) {
    res.render('error');
  }
}

const addAddressCheckout = async (req, res) => {
  try {
       const userData = req.session.userData
      const address = await User.findByIdAndUpdate({_id: userData._id},{$addToSet:{Address: req.body}});
      res.redirect('/checkout');
  } catch (error) {
    res.render('error');
  }
}

const addAddress = async (req, res) => {
  try {
       const userData = req.session.userData
      const address = await User.findByIdAndUpdate({_id: userData._id},{$addToSet:{Address: req.body}});
      res.redirect('/profile');
  } catch (error) {
    res.render('error');
  }
}

const deleteAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const userData = await User.findByIdAndUpdate({_id: req.session.userData._id},{$pull: {Address:{_id: id}}});
      res.redirect('/profile');
  } catch (error) {
    res.render('error');
  }
}

const loadEditAddress = async(req,res)=>{
  try {
    const id = req.query.id;    
    const userAddress = await User.findOne({Address:{$elemMatch:{_id:id}}},{"Address.$":1,_id:0});
    res.render('editaddress',{address:userAddress});
  } catch (error) {
    res.render('error');
  }
}

const editAddress = async(req,res)=>{
  try {
    const id = req.query.id;
    const userAddress = await User.updateOne(
      {Address:{$elemMatch:{_id:id}}},{$set:{"Address.$" :req.body}});
      res.redirect('/profile');
  } catch (error) {
    res.render('error');
  } 
}

const loadOrder = async(req,res)=>{
  try {
      const orderData = await Order.find({userId: req.session.userData._id}).sort({_id:-1})
      res.render('myOrders',{order:orderData})
  } catch (error) {
    res.render('error');
  }
}

const loadSingleOrder = async(req,res)=>{
  try {
      const orderData = await Order.find({orderId: req.query.id}).lean();
      // const pID=orderData[0].product[0].id
      // console.log(pID,"line 17 orderController")
      res.render('singleorder',{order:orderData})//pwer:pID
  } catch (error) {
    res.render('error');
  }
}

const productView =async(req,res)=>{
      try{
    const id = req.query.id;
    const name = req.query.name;
     const product =await Product.findOne({ $or: [{ _id: id }, { productName: name }] })
     const category =await Category.findOne({_id:product.category})
      res.render("single-product",{product:product,category:category});
      }catch(error){
        res.render('error');
      }
}

const  cart = async (req, res) => {
    try {
      const userData=req.session.userData;
       const cartData = await User.aggregate([{$match: {_id:ObjectId(userData._id)}},
       {$lookup: {from: "products",let: {cartItems: "$cart"},pipeline: [{$match: {$expr: 
        {$in: ["$_id", "$$cartItems.productId"],}}}],as: 'productcartData'}}]);
        const productDat = await Product.aggregate([{
            $lookup: {from: "categories",localField: "category",foreignField: "_id",as: "products",},},]);

        const cartProducts = cartData[0].productcartData

        let subtotal = 0;
        cartProducts.forEach((cartProduct) => {
            subtotal = subtotal + Number(cartProduct.price);
        });

        const length = cartProducts.length
        res.render('cart', {cartProducts,subtotal,length});
    } catch (error) {
      res.render('error');
    }
}

const addToCart = async (req, res) => {
  try {
    const {productId} = req.body;
      const cartData = await User.updateOne({ _id: req.session.userData._id}, {$addToSet: {cart: {productId: productId}}});
      const updatedWishlist = await User.findByIdAndUpdate( {_id:req.session.userData._id}, {$pull:{wishlist:productId}},{new:true});
      res.json("success")
  } catch (error) {
    res.render('error');
  }
}

const removeCartProduct = async (req, res) => {
  try {
  const result = await User.findByIdAndUpdate({_id: req.session.userData._id}, { $pull: { cart: {productId: req.params.id }}});
  res.json("success")
  } catch (error) {
    res.render('error');
  }
}

let total
const quantitys=[];
const checkOut = async (req, res) => {
    try {
        const address = await User.find({ _id: req.session.userData._id}).lean();
        const cartData = await User.aggregate([{
                $match: {_id: ObjectId(req.session.userData._id)}},
            {$lookup: {from: "products",let: {cartItems: "$cart"},
             pipeline: [{$match: {$expr: { $in: ["$_id", "$$cartItems.productId"],},},},],as: "Cartproducts",},},]);
        let subtotal = 0;
        
        const cartProducts = cartData[0].Cartproducts;
        cartProducts.map((cartProduct, i) => {
            cartProduct.quantity = req.body.quantity[i];
            subtotal = subtotal + cartProduct.price * req.body.quantity[i];
            quantitys[i]=req.body.quantity[i];
        });
        res.render("checkout", {
            productDetails: cartData[0].Cartproducts,
            subtotal: subtotal,
            address: address[0].Address,
            logged: 1,total:subtotal,
            offer:0
        });
    } catch (error) {
      res.render('error');
    }

}

//load checkout page
const loadcheckoutpage = async (req, res) => {
  try {
    const address = await User.find({ _id: req.session.userData._id}).lean();
    const cartData = await User.aggregate([
      {
        $match: { _id: new ObjectId(req.session.userData._id) },
      },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$cartItems.productId"] } } },
          ],
          as: "Cartproducts",
        },
      },
    ]);
    let subtotal = 0;

    const cartProducts = cartData[0].Cartproducts;
    cartProducts.map((cartProduct, i) => {
      cartProduct.quantity =quantitys[i];
      subtotal = subtotal + cartProduct.price *quantitys[i];
      
    });
    
    res.render("checkout", {
      productDetails: cartData[0].Cartproducts,
      subtotal: subtotal,
      address: address[0].Address,
      logged: 1,
      total: subtotal,
      offer: 0,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadeditaddresscheckoutpage=async(req,res)=>{
  try{
    id=req.query.id;
    const userAddress = await User.findOne({Address:{$elemMatch:{_id:id}}},{"Address.$":1,_id:0});
    res.render("checkoutEditAddress",{address:userAddress})

  }catch(error){
    console.log(error.message);
  }
}

const editAddressCheckout = async(req,res)=>{
  try {
    const id = req.query.id;
    const userAddress = await User.updateOne(
      {Address:{$elemMatch:{_id:id}}},{$set:{"Address.$" :req.body}});
      res.redirect('/checkout');
  } catch (error) {
    res.render('error');
  } 
}


const removeaddresscheckoutpage = async(req,res)=>{
  try{
    const id = req.body.addressId;
      console.log("testing delete num" + id);
      const userId = req.session.userData._id;
  
      const updateResult = await User.updateOne(
        {
          _id: userId,
          "Address._id": id,
        },
        {
          $pull: {
            Address: { _id: id },
          },
        }
      )
      res.json({
        res: "success"
      
      });
  }catch(error){
    console.log(error.message)
  }
  }

  let couponCode
  let couponamount
const placeOrder = async (req, res) => {
  try {
    const {
      productid,
      productname,
      price,
      quantity,
      addressId,
      payment,
      subtotal
    } = req.body;

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;

    const now  = moment()
    const date = now.toDate()

    const shoeProduct = productid.map((item, i) => ({
      id: productid[i],
      name: productname[i],
      price: price[i],
      quantity: quantity[i]
    }));

    let total = subtotal;
    if (req.body.coupon) {
      couponCode = req.body.coupon;
      const applied = await Coupon.findOne({ code: req.body.coupon });
      couponamount = applied.percentage;
      if (couponamount) {
        const amount = (subtotal * couponamount) / 100;
        total = subtotal - amount;
      }
    }

    let data = {
      userId: ObjectId(req.session.userData._id),
      product: shoeProduct,
      orderId: orderId,
      date: moment().toDate(),
      status: "processing",
      payment_method: String(payment),
      addressId: addressId,
      subtotal: subtotal,
      total: total
    };

    const orderPlacement = await Order.insertMany(data);
    const clearCart = await User.updateOne(
      { _id: req.session.userData._id },
      { $set: { cart: [] } }
    );

    quantity.map(async (item, i) => {
      const reduceStock = await Product.updateOne(
        { _id: ObjectId(productid[i]) },
        { $inc: { stock: -Number(item) } }
      );
    });

    if (orderPlacement && clearCart) {
      req.session.page = "fghnjm";
      return res.json({ res: "success", data: data });
    } else {
      const handlePlacementissue = await Order.deleteMany({
        orderId: orderId,
      });
      res.json("try again");
    }
  } catch (error) {
    res.json("try again");
  }
};

let offerPrice
const coupon = async(req,res,next)=>{
    try {
      const codeId = req.body.code
        const total = req.body.total 
      const couponData = await Coupon.findOne({code:codeId}).lean();
      console.log(couponData);
      const userData = await Coupon.findOne({code:codeId, userId:req.session.userData._id}).lean()
      console.log('hiiiii');
      if(couponData && couponData.date > moment().format("YYYY-MM-DD")){
        offerPrice = couponData.percentage
        console.log('0000000000000000000');
       
        if(userData){
          res.json("fail")
        }else{
            const amount = total*offerPrice/100
            const gtotal = total-amount
          res.json({offerPrice:offerPrice,gtotal:gtotal})
          const userupdate = await Coupon.updateOne({code:codeId},{$push:{userId:req.session.userData._id}})
        }
      }else{
        res.json('fail')
      }
     
    } catch (error) {
      next(error);
    }
}

const successorder = async(req,res,next)=>{
  try {
      if(req.session.page){
         delete req.session.page 
          const orderData = await Order.find({}).sort({_id:-1}).limit(1)
      console.log(orderData)
      res.render('successorder',{logged:1,order:orderData})
      }else{
          res.redirect('/')
      }
      
  } catch (error) {
    res.render('error');
  }
}

const invoiceDownload = async (req, res) => {
  try {
    const orderId = req.query.id;
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument({ font: 'Helvetica' });

    // Set the response headers for downloading the PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderId}.pdf"`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add the order details to the PDF document
    doc.fontSize(18).text(`SHOEMART INVOICE`,{ align: 'center' })
    doc.moveDown();
    doc.moveDown();
    doc.fontSize(16).text(`Order Summary - Order ID: ${order.orderId}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Product Name', { width: 200, continued: true });
    doc.fontSize(12).text('Price', { width: 100, align: 'center', continued: true });
    doc.fontSize(12).text('Qty', { width: 50, align: 'right' });
    doc.moveDown();
    
    let totalPrice = 0;
    order.product.forEach((product, index) => {
      doc.fontSize(12).text(`${index + 1}. ${product.name}`, { width: 200, continued: true });
      const totalCost = product.price * product.quantity;
      doc.fontSize(12).text(`${totalCost}`, { width: 100, align: 'center', continued: true });
    
      doc.fontSize(12).text(`${product.quantity}`, { width: 50, align: 'right' });
      doc.moveDown();
      totalPrice += totalCost;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: ${totalPrice}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Amount with discount: ${order.total}`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(12).text(`Ordered Date: ${order.date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})} ${order.date.toLocaleTimeString('en-US', {hour: 'numeric', minute:'numeric'})}`);
    doc.moveDown();
    doc.fontSize(12).text(`Payment Method: ${order.payment_method === '1' ? 'Cash on Delivery' : 'Razor Pay'}`);
    doc.moveDown();
    doc.fontSize(12).text(`Shipping Address: ${order.addressId}`);
    doc.moveDown();
    doc.fontSize(12).text(`Order Status: ${order.status}`);
    
    // Add a "Thank you" message at the end of the invoice
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();
    doc.fontSize(14).text('Thank you for purchasing with us!', { align: 'center' });

    // End the PDF document
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const cancelOrder = async (req, res) => {
  try {
       
      const id = req.query.id;
      const orderData = await Order.findById({_id: id}).lean();
      const pID=orderData.product;
      pID.forEach(async(elem,i)=>{const reduceStock=await Product.updateOne({_id:elem.id},{
            $inc:{
             quantity:+elem.quantity
             }})})

      const userWallet= await User.updateOne(
              { _id: req.session.userData._id },
              { $inc: { wallet: orderData.total } }
            );
      if (orderData.status === "Delivered") {
          const returnOrder = await Order.findOneAndUpdate({ _id:id }, {

              $set: {
                  status: "Returned"

              }

          })
      } else if (orderData.status === "processing") {
          const CancelOrder = await Order.findOneAndUpdate(
              { _id: id },
              {
                  $set: {
                      status: "Cancelled",
                  },
              }
          );
         
      }
      else if (orderData.status === "Shipped") {
          const CancelOrder = await Order.findOneAndUpdate(
              { _id: id },
              {
                  $set: {
                      status: "Cancelled",
                  },
              }
          );
         
      }
      res.redirect('/order');
  } catch (error) {
    res.render('error');
  }
}

  const profileEdit =async(req,res)=>{
    try{
            const id =req.query.id;
            const userData=await User.findById({_id:id});
            if(userData)
            {
            res.render('profileEdit',{userData:userData});
            }
            else{
                res.redirect('/profile')
            }
    }
    catch(error){
      res.render('error');
    }
}

const updateProfile =async(req,res)=>{
  try{
    const id =req.query.id;
      const userData=await User.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}})
      res.redirect('/profile')
}
  catch(error){
    res.render('error');

  }
}

const loadWishlist = async(req,res)=>{
  try {
    const user= await User.findById(req.session.userData._id);
    const wishlistProducts = await Product.find({_id:user.wishlist}); 
    const categories = await Category.find({block:false});    
    res.render('wishlist',{categories, wishlistProducts,user});
  } catch (error) {
    console.log(error.message);
  }
}

const removeWishlist = async(req,res)=>{
  try {
    const {productId,index} = req.body;
    const userId = req.session.userData._id;
    const updatedUser = await User.findByIdAndUpdate(
      {_id:userId},
      {$pull:{wishlist:productId}},
      {new:true}
    );
    if(!updatedUser){
      throw new Error('Error removing the product from the wishlist!');
    }
    const wishlistProducts = updatedUser.wishlist;
    res.json({wishlistProducts,message:"Product removed from the wishlist"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message:"Server error"});
  }
}
 
const addWishlist = async(req,res)=>{
  try {
    const {productId} = req.body;
    const userId = req.session.userData._id;
    const user = await User.findByIdAndUpdate(
      {_id:userId},
      {$addToSet:{wishlist:productId}},
      {new:true}
    );
    res.json({wishlist: user.wishlist}); // Return only the wishlist items
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error adding product to wishlist!"});
  }
}


 


module.exports = { loadRegister,
  homeLoad,
  loginLoad,
  cancelOrder,
  forgetPassword,
  forgetVerify,
  profileView,
  addNewAddress,
  addNewAddressCheckout,
  loadeditaddresscheckoutpage,
  editAddressCheckout,
  removeaddresscheckoutpage,
  addAddressCheckout,
  addAddress,
  deleteAddress,
  loadEditAddress,
  editAddress,
  loadOrder,
  loadSingleOrder,
  invoiceDownload,
  profileEdit,
  updateProfile,
  forgetPasswordLoad,
  resetPassword,
  categoryLoad,
  viewShopProducts,
  RegisterLoad,
  verifyLogin,
  sendOtp,
  verifyOtp,
  contactLoad,
  productView,
  cart,
  addToCart,
  removeCartProduct,
  checkOut,
  loadcheckoutpage,
  successorder,
  coupon,
  placeOrder,
  loadWishlist,
  addWishlist,
  removeWishlist}