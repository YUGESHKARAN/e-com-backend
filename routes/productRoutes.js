const express = require("express");
const router = express.Router();

const multer = require('multer');

const uploadata = multer().fields([
  { name: 'image', maxCount: 5 }, // Allow up to 5 image files
  { name: 'video', maxCount: 1 }, // Allow only 1 video
]);



const {getAllProducts, getSingleProduct, addProducts, updateProduct, deleteProduct} = require("../controller/productController");


router.get("/",getAllProducts);
router.get("/:id",getSingleProduct);
router.post("/add",uploadata,addProducts);
router.put("/update/:id",uploadata,updateProduct);
router.delete("/delete/:id",deleteProduct);

module.exports = router