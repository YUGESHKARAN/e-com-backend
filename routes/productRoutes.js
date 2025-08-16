const express = require("express");
const router = express.Router();

const multer = require('multer');

const uploadata = multer().fields([
  { name: 'image', maxCount: 5 }, // Allow up to 5 image files
  { name: 'video', maxCount: 1 }, // Allow only 1 video
]);

const uploadCelebration = multer().fields([
  { name: 'image', maxCount: 1 }, 
]);


const {getAllProducts, getSingleProduct, addProducts, updateProduct, deleteProduct, getAllCelebrations, getCelebrationProducts, createCelebration, updateCelebrationProducts, deleteCelebration} = require("../controller/productController");


router.get("/",getAllProducts);
router.get("/:id",getSingleProduct);
router.post("/add",uploadata,addProducts);
router.put("/update/:id",uploadata,updateProduct);
router.delete("/delete/:id",deleteProduct);



// Get all celebrations
router.get("/celebrations/all", getAllCelebrations);

// Get products for a specific celebration
router.get("/celebrations/:id", getCelebrationProducts);

router.post("/celebrations",uploadCelebration, createCelebration);
router.put("/celebrations/update/:id",uploadCelebration, updateCelebrationProducts);
router.delete("/celebrations/delete/:id", deleteCelebration);


module.exports = router