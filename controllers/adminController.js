require("dotenv").config();
const config = require("../config/config");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const User = require("../model/userSchema");
const Category = require("../model/categorySchema");
const Coupon = require("../model/coupenSchema");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const moment = require("moment");

// admin Section

const adminLogin = async (req, res) => {
  try {
    console.log("haaai");
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminlogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const adminLogin =async(req,res)=>{
//   try{
//      res.render('adminlogin');
//   }catch(error){
//      console.log(error.message);
//     }
//  }

const adminVerifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("adminlogin", { message: "is not admin" });
        } else {
          req.session.admin = userData._id;
          res.redirect("/admin/dashboard");
          console.log("hi  admin");
        }
      } else {
        res.render("adminlogin", { message: " password  invalid" });
      }
    } else {
      res.render("adminlogin", { message: "email and password are invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminDashboard = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({
      _id: -1,
    });

    res.render("dashboard", { adminlog: 1, order: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const dashboardData = async (req, res, next) => {
  try {
    const orders = await Order.find();

    // Group orders by date and calculate total sales for each day
    const salesByDay = {};
    orders.forEach((order) => {
      const date = moment(order.date).format("YYYY-MM-DD");
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      order.product.forEach((product) => {
        salesByDay[date] += product.price * product.quantity;
      });
    });

    // Create the data for the line graph
    const data = {
      labels: Object.keys(salesByDay),
      datasets: [
        {
          label: "Sales",
          data: Object.values(salesByDay),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };

    //Bar chart
    const Cancelorder = await Order.aggregate([
      {
        $match: {
          $or: [
            {
              status: "Returned",
            },
            {
              status: "Delivered",
            },
            {
              status: "Cancelled",
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            status: "$status",
            date: {
              $month: "$date",
            },
          },
          sum: {
            $sum: 1,
          },
        },
      },
    ]);

    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let Delivered = [];
    let delivered = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Returned = [];
    let returned = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Cancelled = [];
    let cancelled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    Cancelorder.forEach((item) => {
      if (item._id.status == "Delivered") Delivered.push(item);

      if (item._id.status == "Returned") Returned.push(item);

      if (item._id.status == "Cancelled") Cancelled.push(item);
    });

    for (let index = 0; index < 12; index++) {
      months.forEach((item) => {
        if (Delivered[index]) {
          if (item == Delivered[index]._id.date)
            delivered[item - 1] = Delivered[index].sum;
        }

        if (Returned[index]) {
          if (item == Returned[index]._id.date)
            returned[item - 1] = Returned[index].sum;
        }

        if (Cancelled[index]) {
          if (item == Cancelled[index]._id.date)
            cancelled[item - 1] = Cancelled[index].sum;
        }
      });
    }

    // yearly and monthly chart
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
    ]);

    const yearlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          count: 1,
        },
      },
    ]);

    // Send the data as JSON
    res.json({
      chart: { delivered, cancelled, returned },
      data: data,
      monthlyOrders: monthlyOrders,
      yearlyOrders: yearlyOrders,
    });
  } catch (error) {
    console.error(error);
    next(error);
    res.status(500).send("Server error");
  }
};

const salesreport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const orders = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const orderData = [];
    const productData = [];

    orders.forEach((order) => {
      const { orderId, date, payment_method, status, subtotal } = order;

      orderData.push({ orderId, date, payment_method, status, subtotal });

      order.product.forEach((product) => {
        const { id, name, price, quantity } = product;

        productData.push({ orderId, id, name, price, quantity });
      });
    });

    res.json({ orders: orderData, products: productData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve sales report data" });
  }
};

const usersList = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
        { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });
    res.render("userslist", {
      users: userData,
      adminMessage: req.session.adminMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userBlock = (req, res) => {
  const id = req.body.id;
  req.session.adminMessage = "";
  User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: true } })
    .then((response) => {
      const message = "User Blocked Successfully";
      req.session.adminMessage = message;
      req.session.user = false;
      userData = undefined;
      res.json(response);
      res.redirect("/admin/userslist");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const userUnBlock = (req, res) => {
  const id = req.body.id;
  req.session.adminMessage = "";
  User.findOneAndUpdate({ _id: id }, { $set: { blockStatus: false } })
    .then((response) => {
      const message = "User unBlocked Successfully";
      req.session.adminMessage = message;
      res.json(response);
      res.redirect("/admin/userslist");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const orderList = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({ _id: -1 });
    res.render("order", { order: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const loadviewproduct = async (req, res) => {
  try {
    const orderData = await Order.find({ _id: ObjectId(req.query.id) });
    res.render("viewproduct", { order: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const changeStatus = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOne({ _id: id });
    if (orderData.status === "processing") {
      const shipOrder = await Order.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "Shipped",
          },
        }
      );
    } else if (orderData.status === "Shipped") {
      const deliverOrder = await Order.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "Out for Delivery",
          },
        }
      );
    } else if (orderData.status === "Out for Delivery") {
      const deliverOrder = await Order.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "Delivered",
          },
        }
      );
    }
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
  }
};

const loadCoupons = async (req, res) => {
  try {
    const couponData = await Coupon.find();

    res.render("coupon", { coupon: couponData });
  } catch (error) {
    console.log(error);
  }
};

const addCoupon = async (req, res) => {
  try {
    res.render("add-coupon");
  } catch (error) {
    console.log(error);
  }
};

const insertCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      code: req.body.code,
      date: req.body.date,
      percentage: req.body.percent,
    });
    const couponData = await coupon.save();

    if (couponData) {
      res.redirect("/admin/coupon");
    } else {
      res.redirect("/admin/add-coupon");
    }
  } catch (error) {
    console.log(error);
  }
};

const categoryList = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("category", { category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const editCategoryList = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    if (categoryData) {
      res.render("editcategory", { category: categoryData });
    } else {
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateCategoryList = async (req, res) => {
  try {
    const categoryName = req.body.category;
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    const result = await Category.find({ category: req.body.category });
    if (result.length === 0) {
      if (req.body.category == "" || /^\s*$/.test(categoryName)) {
        res.render("editCategory", {
          message: "Please enter Category Name",
          category: categoryData,
        });
      } else {
        const categoryData = await Category.findByIdAndUpdate(
          { _id: req.body.id },
          { $set: { category: req.body.category } }
        );
        res.redirect("/admin/category");
      }
    } else {
      res.render("editCategory", {
        message: "The Category already exists.",
        category: categoryData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const newCategoryLoad = async (req, res) => {
  try {
    res.render("addnewcategory");
  } catch (error) {
    console.log(error.message);
  }
};

const categoryUpload = async (req, res) => {
  try {
    if (req.body.category !== "") {
      const result = await Category.find({ category: req.body.category });
      if (result.length === 0) {
        const categoryData = new Category(req.body);
        await categoryData.save();
        res.redirect("/admin/category");
      } else {
        res.render("addnewcategory", {
          message: "The Category already exists.",
        });
      }
    } else {
      const message = "The Category field can't be null";
      res.render("addnewcategory", { message: message });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const productList = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const productData = await Product.find({
      isDeleted: false,
      $or: [{ productName: { $regex: ".*" + search + ".*", $options: "i" } }],
    }).populate("category");
    res.render("product", {
      product: productData,
      adminMessage: req.session.productMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editProductLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id });
    const categoryData = await Category.find({});
    if (productData) {
      res.render("editProduct", {
        product: productData,
        category: categoryData,
      });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  const images = req.files.map((file) => {
    return file.filename;
  });
  const id = req.query.id;
  const updation = {
    $set: {
      productName: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      isDeleted: false,
    },
  };
  if (images.length > 0) {
    updation.$set.images = images;
  }

  try {
    await Product.updateOne({ _id: id }, updation);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message);
  }
};

const newProductLoad = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("addnewproduct", {
      category: categoryData,
      message: req.session.messager,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const response = await Product.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const productUpload = (req, res) => {
  const images = req.files.map((file) => {
    return file.filename;
  });
  if (
    req.body.name != "" &&
    req.body.price != "" &&
    req.body.description != "" &&
    req.body.stock != "" &&
    req.body.category != ""
  ) {
    const productData = new Product({
      productName: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      __v: 1,
      images: images,
      isDeleted: false,
    });
    productData
      .save()
      .then(() => {
        req.session.messager = "";
        const message = "Product added successfully";
        req.session.productMessage = message;
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    const message = "fields don't be blank";
    req.session.messager = message;
    res.redirect(`/admin/addProduct?message=${message}`);
  }
};

module.exports = {
  adminLogin,
  adminVerifyLogin,
  adminDashboard,
  dashboardData,
  salesreport,
  usersList,
  userBlock,
  userUnBlock,
  orderList,
  changeStatus,
  loadCoupons,
  addCoupon,
  insertCoupon,
  loadviewproduct,
  categoryList,
  productList,
  newProductLoad,
  productUpload,
  newCategoryLoad,
  categoryUpload,
  editCategoryList,
  updateCategoryList,
  deleteCategory,
  editProductLoad,
  updateProduct,
  deleteProduct,
};
