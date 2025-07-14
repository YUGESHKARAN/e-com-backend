const mongoose = require("mongoose");

let isConnected; // Track the connection status

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  console.log("Establishing new database connection");
  
  await mongoose.connect("mongodb+srv://yugeshkaran01:srhdvdv6P34DMMlz@cluster2.mkkms5g.mongodb.net/E-com?retryWrites=true&w=majority&appName=Cluster2", {
    maxPoolSize: 10, // Optional: set a pool size
    serverSelectionTimeoutMS: 5000 // Set a timeout for server selection
  });
  isConnected = mongoose.connection.readyState; // 1 for connected
};

module.exports = connectToDatabase;
