import { Router } from "express";
import { ProductController } from "../../controllers/product.controller";
import { authenticate, authorizeRole } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { ProductRepository } from "../../repositories/product.repository";
import { ProductService } from "../../services/product.service";

const router = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get("/", authenticate, productController.listProducts);
router.post(
  "/import",
  authenticate,
  authorizeRole("admin"),
  upload.single("file"),
  productController.importProducts
);
router.post("/sell", authenticate, productController.sellProducts);
router.get(
  "/recommend/:sku",
  authenticate,
  productController.recommendProducts
);

export default router;
