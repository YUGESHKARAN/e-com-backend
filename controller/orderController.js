
const { Customer, Product, Order } = require("../model/mainSchema");




const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ ordered_at: -1 }); // newest first

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addOrders = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      to_address,
      products,
      totalPrice,
      payment_status,
      payment_mode,
      delivery_status = 'pending'
    } = req.body;

    // Validate required fields
    if (
      !customer_name || !customer_email || !to_address ||
      !products || !Array.isArray(products) || products.length === 0 ||
      totalPrice === undefined
    ) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    // Create new order
    const newOrder = new Order({
      customer_name,
      customer_email,
      to_address,
      products,
      totalPrice,
      payment_mode,
      payment_status: payment_status || false,
      delivery_status
    });

    await newOrder.save();

    res.status(200).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error("Error adding order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const orders = await Order.find({ customer_email: email }).sort({ ordered_at: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this customer" });
    }

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    // Fetch the existing order
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update only the fields that are provided in req.body
    if (updateData.customer_name !== undefined)
      existingOrder.customer_name = updateData.customer_name;

    if (updateData.customer_email !== undefined)
      existingOrder.customer_email = updateData.customer_email;

    if (updateData.to_address !== undefined)
      existingOrder.to_address = { ...existingOrder.to_address.toObject(), ...updateData.to_address };

    if (updateData.products !== undefined)
      existingOrder.products = updateData.products;

     if (updateData.payment_mode !== undefined)
      existingOrder.payment_mode = updateData.payment_mode;

    if (updateData.totalPrice !== undefined)
      existingOrder.totalPrice = updateData.totalPrice;

    if (updateData.delivery_status !== undefined)
      existingOrder.delivery_status = updateData.delivery_status;

    if (updateData.payment_status !== undefined)
      existingOrder.payment_status = updateData.payment_status;

    await existingOrder.save();

    res.status(200).json({ message: "Order updated successfully", order: existingOrder });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully", deletedOrder });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {addOrders, getAllOrders, getOrdersByEmail, updateOrder, deleteOrder}