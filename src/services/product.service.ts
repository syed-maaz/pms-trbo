import { v4 as uuidv4 } from "uuid";
import { ProductRow } from "../controllers/product.types";
import { Product } from "../entities/product.entity";
import { ProductRepository } from "../repositories/product.repository";
import { parseCSV } from "../utils/csvParser";
import { logger } from "../utils/logger";

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  // List all products with sorting
  async listProducts(
    filters: { price?: number; sku?: string; stock?: string; title?: string },
    sortBy: string = "price",
    order: "ASC" | "DESC" = "ASC"
  ): Promise<Product[]> {
    try {
      return await this.productRepository.findAll(filters, sortBy, order);
    } catch (err) {
      console.log(err);
      logger.error("Failed to list products", err);
      throw new Error("Failed to list products");
    }
  }

  // Parse and process the CSV file
  async parseAndProcessCSV(filePath: string): Promise<any[]> {
    const results: any[] = [];
    let promises: Promise<any>[] = [];

    // Begin the transaction at the service layer
    await this.productRepository.beginTransaction();

    try {
      // Assuming parseCSV is an async method, gather promises to process each row
      await parseCSV(filePath, async (row: ProductRow) => {
        // Push each row processing promise to the array

        promises.push(this.processRow(row));
      });

      // Use Promise.all to resolve all row processing promises concurrently
      const processedResults = await Promise.all(promises);

      // Add the processed results to the results array
      processedResults.forEach((result) => {
        results.push(result);
      });

      // Commit the transaction if all rows are processed successfully
      await this.productRepository.commitTransaction();

      return results;
    } catch (err) {
      // Rollback the transaction on error
      await this.productRepository.rollbackTransaction();
      logger.error(
        "Error during CSV processing, transaction rolled back.",
        err
      );
      throw new Error("CSV processing failed. Transaction rolled back.");
    }
  }

  // Sell a product and update stock
  async sellProducts(skus: string[]): Promise<void> {
    // Begin a transaction for atomicity
    await this.productRepository.beginTransaction();
    try {
      // Iterate through the SKUs to update stock and track related products
      for (const sku of skus) {
        const product: Product | null = await this.productRepository.findBySku(
          sku
        );
        if (!product || product.stock <= 0) {
          console.log(
            `Product with SKU ${sku} is out of stock or does not exist`
          );
          throw new Error(
            `Product with SKU ${sku} is out of stock or does not exist`
          );
        }

        // Reduce stock by 1 (or the sold quantity if specified)
        product.stock -= 1;
        await this.productRepository.updateStock(product);
      }

      // Record pairwise sales for recommendations
      for (let i = 0; i < skus.length; i++) {
        for (let j = 0; j < skus.length; j++) {
          if (i !== j) {
            await this.productRepository.recordSale(skus[i], skus[j]);
          }
        }
      }

      // Commit transaction after successful stock updates and sales tracking
      await this.productRepository.commitTransaction();
    } catch (err) {
      // Rollback transaction in case of an error
      console.log(err);
      await this.productRepository.rollbackTransaction();
      throw err;
    }
  }

  // Recommend products based on frequently bought together data
  async recommendProducts(sku: string): Promise<string[]> {
    try {
      return await this.productRepository.findRelatedSkus(sku);
    } catch (err) {
      logger.error(`Failed to get recommendations for SKU: ${sku}`, err);
      throw new Error(`Failed to get recommendations for SKU: ${sku}`);
    }
  }

  // Process each row from the CSV file
  async processRow(
    row: ProductRow
  ): Promise<{ row: any; status: string; error?: string }> {
    try {
      // Check if the SKU is provided
      if (!row.sku) {
        row.sku = this.generateSku(row);
      }
      // Check if the product exists
      const product = await this.productRepository.findBySku(row.sku);

      if (product) {
        return { row, status: "exists" };
      }
      await this.addProduct(row);
      return { row, status: "success" };
    } catch (err) {
      logger.error(`Failed to import row: ${JSON.stringify(row)}`, err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return { row, status: "failed", error: errorMessage };
    }
  }

  // Add a new product (used in CSV import)
  async addProduct(productData: ProductRow): Promise<void> {
    try {
      const product = new Product(
        0, // Auto-incremented ID
        productData.title,
        productData.link,
        productData.image_link,
        productData.pizza_type,
        productData.price,
        productData.sale_price,
        productData.explanation,
        productData.rating,
        productData.rating_count,
        productData.stock === "In Stock" ? 1 : 0,
        productData.sku,
        productData.category,
        productData.diet
      );

      // Use repository to save the product
      await this.productRepository.saveProduct(product);
    } catch (err) {
      logger.error(`Failed to add product: ${productData.sku}`, err);
      throw new Error(`Failed to add product: ${productData.sku}`);
    }
  }

  generateSku(product: ProductRow): string {
    const randomString = uuidv4().slice(0, 8); // Generate a short UUID or use a timestamp
    const titlePart = product.title.replace(/\s+/g, "-").toUpperCase(); // Create a SKU based on the title
    return `${titlePart}`;
  }
}
