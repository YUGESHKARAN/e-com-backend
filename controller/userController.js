const { Customer, Product } = require("../model/mainSchema");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const jwt = require("jsonwebtoken");

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Customer.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid email" });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({
        token,
        name: user.customer_name,
        email: user.email,
        role: user.role,
        message: "Login successful",
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get customers details

const getAllCustomers = async (req, res) => {
  try {
    const users = await Customer.find({});
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    const customers = users.filter((user) => user.role === "customer"); // Filter customers
    // const admins = users.filter(user => user.role === 'admin'); // Filter admins
    // Respond with the list of users
    res.status(200).json(customers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get All Admins details
const getAllAdmins = async (req, res) => {
  try {
    const users = await Customer.find({});
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    // const customers = users.filter(user => user.role === 'customer'); // Filter customers
    const admins = users.filter((user) => user.role === "admin"); // Filter admins
    // Respond with the list of users
    res.status(200).json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User Registration Controller
const userRegister = async (req, res) => {
  try {
    const { customer_name, email, password, role } = req.body;

    if (!customer_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Check if user already exists
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Customer({
      customer_name,
      email,
      password: hashedPassword,
      role: role,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addFavoriteProduct = async (req, res) => {
  try {
    const { email, productId } = req.body;

    if (!email || !productId) {
      return res
        .status(400)
        .json({ error: "email and productId are required" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if product is already in favorites
    const favIndex = user.favorites.findIndex((fav) =>
      fav._id.equals(product._id)
    );

    if (favIndex !== -1) {
      // If already in favorites, remove it
      user.favorites.splice(favIndex, 1);
      await user.save();
      return res
        .status(200)
        .json({
          message: "Product removed from favorites",
          favorites: user.favorites,
        });
    } else {
      // If not in favorites, add it
      user.favorites.push(product);
      await user.save();
      return res
        .status(200)
        .json({
          message: "Product added to favorites",
          favorites: user.favorites,
        });
    }
  } catch (err) {
    console.error("Error updating favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFavoriteProduct = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await Customer.findOne({ email });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!user) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get cart products

const getCartProducts = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await Customer.findOne({ email });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!user) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ cart: user.cart });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// add Cart product

const addCartProduct = async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;

    if (!email || !productId) {
      return res
        .status(400)
        .json({ error: "email and productId are required" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if product is already in cart
    const cartIndex = user.cart.findIndex((item) =>
      item.product.equals(product._id)
    );
    if (cartIndex !== -1) {
      // If already in cart, update quantity
      user.cart[cartIndex].quantity += quantity ? Number(quantity) : 1;
    } else {
      // If not in cart, add it
      user.cart.push({
        product: product._id,
        product_name:product.product_name,
        category:product.category,
        quantity: quantity ? Number(quantity) : 1,
        product_image: product.product_images[0] || "",
        discount: product.discount,
        price: product.price,
      });
    }

    await user.save();
    res.status(200).json({ message: "Product added to cart", cart: user.cart });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deleteCartProduct = async (req, res) => {
  try {
    const { email, productId } = req.params;

    console.log("email",email)

    if (!email || !productId) {
      return res.status(400).json({ error: "email and productId are required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove the product from cart
    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter(item => !item.product.equals(productId));

    if (user.cart.length === initialCartLength) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    await user.save();
    res.status(200).json({ message: "Product removed from cart", cart: user.cart });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deleteAllCartItems = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear the cart
    user.cart = [];

    await user.save();

    res.status(200).json({ message: "All cart items removed successfully", cart: user.cart });
  } catch (err) {
    console.error("Error deleting all cart items:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const updateCartProductQuantity = async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;

    if (!email || !productId || quantity < 1) {
      return res.status(400).json({ error: "email, productId, and valid quantity are required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the cart item
    const cartIndex = user.cart.findIndex(item => item.product.equals(productId));
    if (cartIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    // Update the quantity
    user.cart[cartIndex].quantity = Number(quantity);
    await user.save();

    res.status(200).json({ message: "Cart item quantity updated", cart: user.cart });
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// Get address

const getAddress = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await Customer.findOne({ email });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!user) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ address: user.addresses });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add address

const addUserAddress = async (req, res) => {
  try {
    const { email, address } = req.body;

    // Validate input
    if (
      !email ||
      !address ||
      !address.name ||
      !address.street ||
      !address.phone ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.country
    ) {
      return res.status(400).json({ error: "email and complete address fields are required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add address to user's addresses array
    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const editUserAddress = async (req, res) => {
  try {
    const { email, addressId, address } = req.body;

    if (!email || !addressId || !address) {
      return res.status(400).json({ error: "email, addressId, and address object are required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the address by index or _id
    const addrIndex = user.addresses.findIndex((addr, idx) => idx == addressId || (addr._id && addr._id.equals(addressId)));
    if (addrIndex === -1) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Update only provided fields, keep existing values for missing fields
    const existingAddress = user.addresses[addrIndex];
    user.addresses[addrIndex] = {
      ...existingAddress.toObject(),
      ...address
    };

    await user.save();

    res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (err) {
    console.error("Error editing address:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deleteUserAddress = async (req, res) => {
  try {
    const { email, addressId } = req.body;

    // Validate input
    if (!email || !addressId) {
      return res.status(400).json({ error: "Email and addressId are required" });
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out the address to be removed
    const updatedAddresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    // If no address was removed
    if (updatedAddresses.length === user.addresses.length) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Update and save
    user.addresses = updatedAddresses;
    await user.save();

    res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  login,
  userRegister,

  getAllCustomers,
  getAllAdmins,
  

  addFavoriteProduct,
  getFavoriteProduct,

  addCartProduct,
  getCartProducts,
  deleteCartProduct,
  updateCartProductQuantity,
  deleteAllCartItems,

  addUserAddress,
  getAddress,
  editUserAddress,
  deleteUserAddress
};
