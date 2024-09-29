import { NextFunction, Request, Response } from "express";
import { getProductColumns } from "../entities/product.entity";
import { ProductService } from "../services/product.service";

export class ProductController {
  private productService: ProductService;

  constructor(_productService: ProductService) {
    this.productService = _productService;
  }

  // Import products from CSV file
  importProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const results = await this.productService.parseAndProcessCSV(
        req.file.path
      );

      const successful = results.filter((r) => r.status === "success").length;
      const failed = results.filter((r) => r.status === "failed").length;

      res.status(200).json({
        message: "CSV import completed",
        successful,
        failed,
        errors: results.filter((r) => r.status === "failed"),
      });
    } catch (err) {
      next(err);
    }
  };

  // List all products
  listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        price,
        sku,
        stock,
        title,
        sortBy = "price",
        order = "ASC",
      } = req.query;

      const validSortFields = getProductColumns();
      const validOrderValues = ["ASC", "DESC"];

      // Validate the sortBy field
      if (!validSortFields.includes(sortBy as string)) {
        res.status(400).json({
          message: `Invalid sorting options provided`,
        });
        return;
      }

      // Validate the order value
      if (!validOrderValues.includes(order as string)) {
        res.status(400).json({
          message: `Invalid order value. Must be either "ASC" or "DESC"`,
        });
        return;
      }

      // Pass filters and sorting options to the service
      const products = await this.productService.listProducts(
        {
          price: price ? parseFloat(price as string) : undefined,
          sku: sku as string,
          stock: stock ? (stock as string) : undefined,
          title: title as string,
        },
        sortBy as string,
        order as "ASC" | "DESC"
      );

      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  };

  // Sell a product
  sellProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { skus } = req.body; // Assume `skus` is an array of SKUs sold together.

      if (!skus || skus.length === 0) {
        res.status(400).json({ message: "SKUs are required" });
        return;
      }

      // Sell products and track sales
      await this.productService.sellProducts(skus);

      res.status(200).json({ message: "Products sold successfully" });
    } catch (err) {
      next(err);
    }
  };

  // Recommend products
  recommendProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sku } = req.params;
      if (!sku) {
        res.status(400).json({ message: "SKU is required" });
        return;
      }

      // Fetch recommendations from the service
      const recommendations = await this.productService.recommendProducts(sku);
      res.status(200).json({ recommended_products: recommendations });
    } catch (err) {
      next(err);
    }
  };
}
