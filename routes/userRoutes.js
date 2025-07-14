const express = require("express");
const router = express.Router();

const {
  userRegister,
  getAllCustomers,
  getAllAdmins,
  login,
  addFavoriteProduct,
  getFavoriteProduct,
  addCartProduct,
  getCartProducts,
  deleteCartProduct,
  updateCartProductQuantity,
  addUserAddress,
  getAddress,
  editUserAddress,
  deleteUserAddress,
  deleteAllCartItems
} = require("../controller/userController");

router.get("/customers", getAllCustomers);
router.get("/admins", getAllAdmins);
router.post("/register", userRegister);

router.post("/login", login);

router.get("/favorites/:email", getFavoriteProduct);
router.post("/favorites", addFavoriteProduct);

router.get("/cart/:email", getCartProducts);
router.post("/cart", addCartProduct);
router.put("/cart/updateqty",updateCartProductQuantity)
router.delete("/cart/delete/:email/:productId",deleteCartProduct)
router.delete("/cart/delete-all/:email",deleteAllCartItems)

router.get("/get/address/:email", getAddress);
router.post('/add/address',addUserAddress);
router.put('/edit/address',editUserAddress);
router.delete('/delete/address',deleteUserAddress);


module.exports = router;
