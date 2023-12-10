import { model, Schema, Types } from "mongoose";

const ProductSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [40, "Title cannot be more than 40 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [200, "Description cannot be more than 200 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    maxlength: [5, "Price cannot be more than 5 characters"],
  },
  discountPrice: {
    type: Number,
    maxlength: [5, "Discount Price cannot be more than 5 characters"],
  },
  images: {
    type: [{ type: String }],
  },
  category: {
    type: Types.ObjectId,
    ref: "Category",
  },
  properties: {
    type: Object,
  },
}, {
	timestamps: true,
});

let Product;

try {
  Product = model('Product');
} catch (error) {
  Product = model('Product', ProductSchema);
}

export { Product };