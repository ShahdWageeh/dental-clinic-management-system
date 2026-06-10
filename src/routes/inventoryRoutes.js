import express from "express";
import {
  createItem,
  getItems,
  getSingleItem,
  updateItem,
  deleteItem,
  addStock,
  consumeStock,
  getLowStock,
} from "../controllers/inventoryController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  createItemValidation,
  updateItemValidation,
  stockValidation,
} from "../validations/inventoryValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
const router = express.Router();

// ⚠️ low-stock قبل /:id عشان ما يتعاملش معاه كـ id
router.get("/low-stock", protect, authorizeRoles("admin"), getLowStock);


router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createItemValidation,
  validateMiddleware,
  createItem
);
router.get("/", protect, authorizeRoles("admin", "doctor"), getItems);
router.get("/:id", protect, authorizeRoles("admin", "doctor"), getSingleItem);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateItemValidation,
  validateMiddleware,
  updateItem
);

router.patch(
  "/:id/add-stock",
  protect,
  authorizeRoles("admin"),
  stockValidation,
  validateMiddleware,
  addStock
);
router.delete("/:id", protect, authorizeRoles("admin"), deleteItem);

router.patch(
  "/:id/consume",
  protect,
  authorizeRoles("admin", "doctor"),
  stockValidation,
  validateMiddleware,
  consumeStock
);

export default router;