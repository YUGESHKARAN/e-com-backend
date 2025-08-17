const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

/**
 * Product Schema
 */
const productSchema = new Schema({
  product_name:  { type: String, required: true, index: true },
  description:  { type: String, required: true, index: true },
  category:      { type: String, required: true, index: true },
  price:         { type: Number, required: true, min: 0 },
  discount:      { type: Number, default: 0, min: 0, max: 100 },  // percentage
  product_images:[String],                                       // filenames or URLs
  in_stock:      { type: Boolean, default: true },
  banner:        { type: Boolean, default: false },
  best_seller:        { type: Boolean, default: false },
  demo_video:    { type: String },                             // URL or filename
  rating:        { type: Number, default: 5, min: 0, max: 5 }   
}, {
  timestamps: true
});

const Product = model('Product', productSchema);



/**
 * Order Schema
 */
const orderItemSchema = new Schema({
  productId:        { type: Types.ObjectId, ref: 'Product', required: true },
  product_name:   { type: String, required: true },  // denormalized snapshot
  product_image:  { type: String },
  price:          { type: Number, required: true },
  total:          { type: Number, required: true },
  quantity:       { type: Number, required: true, min: 1 }
}, { _id: true });

const addressSchema = new Schema({
  _id:  { type: Types.ObjectId, default: () => new Types.ObjectId() },
  name:{ type: String, required: true },
  street:   { type: String, required: true },
  phone: {type:Number, required: true},
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  zip:      { type: String, required: true },
  country:  { type: String, required: true }
}, { _id: true });

const orderSchema = new Schema({
  _id:        { type: Types.ObjectId, default: () => new Types.ObjectId() },
  customer_name:   { type: String, required: true },
  customer_email:  { type: String, required: true },
  to_address:      { type: addressSchema, required: true },
  products:        { type: [orderItemSchema], required: true },
  totalPrice:          { type: Number, required: true },
  delivery_status: { type: String, enum: ['pending','delivered','cancelled'], default: 'pending' },
  payment_mode: { type: String, enum: ['online','offline'], default: 'online' },
  payment_status:  { type: Boolean, default: false },
  ordered_at:      { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Order = model('Order', orderSchema);

/**
 * Customer Schema
 */


const cartItemSchema = new Schema({
  product:  { type: Types.ObjectId, ref: 'Product', required: true },
  product_name:  { type: String, required: true, index: true },
  category:      { type: String, required: true, index: true },
  quantity: { type: Number, default: 1, min: 1 },
  product_image:  { type: String },
  discount:      { type: Number, default: 0, min: 0, max: 100 },
  price:    { type: Number, required: true, min: 0 }  // price at time of adding to cart
}, { _id: false });

const customerSchema = new Schema({
  customer_name: { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },
  addresses:     { type: [addressSchema], default: [] },
  role:          { type: String, enum: ['customer','admin'], default: 'customer' },
  cart:          { type: [cartItemSchema], default: [] },
  favorites:     {type:[productSchema], default: []}, // denormalized snapshot of favorite products
  // orders: {type: [orderSchema], default: []} // denormalized snapshot of orders
}, {
  timestamps: true
});

const Customer = model('Customer', customerSchema);


const celebrationSchema = new Schema({
  title: { type: String, required: true, index: true },  // e.g. "Janmashtami"
  date: { type: Date, required: true, index: true },     // celebration date
  description: { type: String },
  image: { type: String, required: true },                               // filename or URL
  products: [{ type: Types.ObjectId, ref: "Product" }]   // linked gift products
}, {
  timestamps: true
});

const Celebration = model("Celebration", celebrationSchema);


module.exports = { Product, Customer, Order, Celebration };
