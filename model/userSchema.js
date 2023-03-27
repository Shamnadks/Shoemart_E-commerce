const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    blockStatus: {
      type: Boolean,
    },
    Address: [
      {
        name: { type: String, required: true },
        number: { type: String, required: true },
        house: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        delivery_point: { type: String, required: true },
      },
    ],
    cart: [
      {
        productId: { type: ObjectId },
        quantity: { type: Number },
        _id: false,
      },
    ],
    is_admin: {
      type: Number,
      required: true,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: "",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
