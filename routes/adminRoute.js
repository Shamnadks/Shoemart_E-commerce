const express=require('express');
const admin_route=express();
const adminController=require("../controllers/adminController");
const config=require("../config/config");
const Upload = require('../helpers/multer');
const bodyParser=require("body-parser");
const session=require("express-session");
const auth=require("../middleware/auth")




admin_route.use(session({secret:config.sessionSecret,resave: true,saveUninitialized: true}));
admin_route.use((req,res,next)=>{res.set('cache-control','no-store')
            next();})

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));


admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

admin_route.get('/admin',adminController.adminLogin);
admin_route.post('/admin',adminController.adminVerifyLogin);

admin_route.get('/admin/dashboard',auth.adminLogin,adminController.adminDashboard);
admin_route.get("/admin-dash", adminController.dashboardData);
admin_route.get("/salesreport",adminController.salesreport)

admin_route.get('/admin/userslist',auth.adminLogin,adminController.usersList);
admin_route.post('/admin/users/block',adminController.userBlock);
admin_route.post('/admin/users/unblock',adminController.userUnBlock);

admin_route.get('/admin/category',auth.adminLogin,adminController.categoryList);
admin_route.get('/admin/categoryedit',auth.adminLogin,adminController.editCategoryList);
admin_route.post('/admin/categoryedit',auth.adminLogin,adminController.updateCategoryList);
admin_route.get('/admin/addcategory',auth.adminLogin,adminController.newCategoryLoad);
admin_route.post('/admin/addcategory',auth.adminLogin,adminController.categoryUpload);
admin_route.get('/admin/deletecategory',auth.adminLogin,adminController.deleteCategory);

admin_route.get('/admin/products',auth.adminLogin,adminController.productList);
admin_route.get('/admin/productEdit',auth.adminLogin,adminController.editProductLoad);
admin_route.post('/admin/productEdit',Upload.array('image',3),adminController.updateProduct);
admin_route.get('/admin/addproduct',auth.adminLogin,adminController.newProductLoad);
admin_route.post('/admin/addproduct',Upload.array('image',3),adminController.productUpload);
admin_route.post('/admin/products/delete',adminController.deleteProduct);

admin_route.get('/admin/orders',auth.adminLogin,adminController.orderList);
admin_route.get('/admin/view-product',auth.adminLogin,adminController.loadviewproduct);
admin_route.get('/admin/change-status',adminController.changeStatus);
admin_route.get('/admin/coupon',auth.adminLogin,adminController.loadCoupons);
admin_route.get('/admin/add-coupon',auth.adminLogin,adminController.addCoupon);
admin_route.post('/admin/add-coupon',auth.adminLogin,adminController.insertCoupon);

admin_route.get('/admin/logout',auth.adminLogout);













module.exports=admin_route;