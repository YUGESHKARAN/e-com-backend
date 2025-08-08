
const {Product} = require("../model/mainSchema");
// s3 integration
const { S3Client,PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config()


const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


const s3 = new S3Client({
  credentials:{
    accessKeyId:accessKey,
    secretAccessKey:secretAccessKey,
  },
  region:bucketRegion
})



// Get all products 
const getAllProducts = async(req,res)=>{
    try{

        const products = await Product.find({}).sort({createdAt: -1}); // Fetch all products sorted by creation date
        if(products.length === 0){
            return res.status(404).json({ message: "No products found" });
        }
        // Respond with the list of products
        res.status(200).json(products);

    }
    catch(err){
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Internal server error" });   
    }
}


// Get a single product by ID
const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



// Add a new product ------ Changes required
const addProducts = async (req, res) => {
  try {
    const { product_name, description, category, price, discount, in_stock, banner, best_seller } = req.body;

    if (!product_name || !description || !price || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }
    console.log("req.body", req.body);  
    console.log("req.files", req.files);

    const product_images = [];
    let demo_video = "";

    // Upload images to S3 and store file names
    if (req.files && req.files.image) {
      for (const img of req.files.image) {
        const params = {
          Bucket: bucketName,
          Key: img.originalname,
          Body: img.buffer,
          ContentType: img.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);
        product_images.push(img.originalname); // store only file name
      }
    }

    // Upload video to S3 and store file name
    if (req.files && req.files.video && req.files.video.length > 0) {
      const vid = req.files.video[0];
      const params = {
        Bucket: bucketName,
        Key: vid.originalname,
        Body: vid.buffer,
        ContentType: vid.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
      demo_video = vid.originalname; // store only file name
    }

    const newProduct = new Product({
      product_name,
      description,
      price,
      category,
      discount,
      product_images,
      in_stock,
      banner,
      demo_video,
      best_seller
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update product details --- Changes required
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Fetch the existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Handle updated images
    let product_images = existingProduct.product_images;
    if (req.files && req.files.image) {
      product_images = [];
      for (const img of req.files.image) {
        const params = {
          Bucket: bucketName,
          Key: img.originalname,
          Body: img.buffer,
          ContentType: img.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
        product_images.push(img.originalname); // store only file name
      }
    }

    // Handle updated video
    let demo_video = existingProduct.demo_video;
    if (req.files && req.files.video && req.files.video.length > 0) {
      const vid = req.files.video[0];
      const params = {
        Bucket: bucketName,
        Key: vid.originalname,
        Body: vid.buffer,
        ContentType: vid.mimetype,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      demo_video = vid.originalname; // store only file name
    }

    // Destructure or fallback to existing values
    const {
      product_name = existingProduct.product_name,
      description = existingProduct.description,
      category = existingProduct.category,
      price = existingProduct.price,
      discount = existingProduct.discount,
      in_stock = existingProduct.in_stock,
      banner = existingProduct.banner,
      best_seller = existingProduct.best_seller
    } = req.body;

    // Optional validation (skip if partial updates allowed)
    if (!product_name || !description || !price || !category) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        product_name,
        description,
        category,
        price,
        discount,
        in_stock,
        banner,
        product_images,
        demo_video,
        best_seller
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// const deleteProduct = async (req, res) => {
//     try {
//         const productId = req.params.id;

//         // Check if the product exists
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         // Delete the product
//         await Product.findByIdAndDelete(productId);

//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (err) {
//         console.error("Error deleting product:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete all product images from S3
    if (product.product_images && product.product_images.length > 0) {
      for (const imageName of product.product_images) {
        const deleteParams = {
          Bucket: bucketName,
          Key: imageName, // assuming imageName is the filename (not full URL)
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
      }
    }

    // Delete demo video from S3 if it exists
    if (product.demo_video) {
      const deleteParams = {
        Bucket: bucketName,
        Key: product.demo_video, // assuming this is just the S3 key
      };
      await s3.send(new DeleteObjectCommand(deleteParams));
    }

    // Delete the product document from MongoDB
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product and associated files deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {getAllProducts, getSingleProduct, addProducts, updateProduct, deleteProduct}